import { DeclaredTypeName, ErrorName, IntermediateRepresentation } from "@fern-fern/ir-model";
import { ServiceDeclarationHandler } from "@fern-typescript/client-v2";
import { File, GeneratorContext } from "@fern-typescript/declaration-handler";
import { ErrorDeclarationHandler } from "@fern-typescript/errors-v2";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeDeclarationHandler } from "@fern-typescript/types-v2";
import { Volume } from "memfs/lib/volume";
import { Directory, Project } from "ts-morph";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { convertExportedFilePathToFilePath, ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { ExportsManager } from "../exports-manager/ExportsManager";
import { createExternalDependencies } from "../external-dependencies/ExternalDependencies";
import { generateTypeScriptProject } from "../generate-ts-project/generateTypeScriptProject";
import { getRelativePathAsModuleSpecifierTo } from "../getRelativePathAsModuleSpecifierTo";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { ROOT_API_DIRECTORY } from "./utils/getExportedDirectoriesForFernFilepath";
import { getExportedFilepathForService } from "./utils/getExportedFilepathForService";
import { getExportedFilepathForType } from "./utils/getExportedFilepathForType";
import { getGeneratedTypeName } from "./utils/getGeneratedTypeName";
import { getReferenceToExportedType } from "./utils/getReferenceToExportedType";
import { getReferenceToService } from "./utils/getReferenceToService";
import { getReferenceToType } from "./utils/getReferenceToType";
import { writeClientFile } from "./writeClientFile";

export declare namespace FernTypescriptClientGenerator {
    export interface Init {
        apiName: string;
        intermediateRepresentation: IntermediateRepresentation;
        context: GeneratorContext;
        volume: Volume;
        packageName: string;
        packageVersion: string | undefined;
    }
}

export class FernTypescriptClientGenerator {
    private apiName: string;
    private context: GeneratorContext;
    private intermediateRepresentation: IntermediateRepresentation;

    private rootDirectory: Directory;
    private exportsManager = new ExportsManager();
    private dependencyManager = new DependencyManager();
    private typeResolver: TypeResolver;
    private errorResolver: ErrorResolver;

    private generatePackage: () => Promise<void>;

    constructor({
        apiName,
        intermediateRepresentation,
        context,
        volume,
        packageName,
        packageVersion,
    }: FernTypescriptClientGenerator.Init) {
        this.apiName = apiName;
        this.context = context;
        this.intermediateRepresentation = intermediateRepresentation;

        const project = new Project({
            useInMemoryFileSystem: true,
        });
        this.rootDirectory = project.createDirectory("/");
        this.typeResolver = new TypeResolver(intermediateRepresentation);
        this.errorResolver = new ErrorResolver(intermediateRepresentation);

        this.generatePackage = async () => {
            await generateTypeScriptProject({
                volume,
                packageName,
                packageVersion,
                project,
                dependencies: this.dependencyManager.getDependencies(),
            });
        };
    }

    public async generate(): Promise<void> {
        await this.generateTypeDeclarations();
        await this.generateErrorDeclarations();
        await this.generateServiceDeclarations();
        await this.generateClientFile();
        this.exportsManager.writeExportsToProject(this.rootDirectory);
        for (const sourceFile of this.rootDirectory.getSourceFiles()) {
            sourceFile.formatText();
        }
        await this.generatePackage();
    }

    private async generateTypeDeclarations() {
        for (const typeDeclaration of this.intermediateRepresentation.types) {
            await TypeDeclarationHandler.run(typeDeclaration, {
                withFile: (run) => this.withTypeDeclartionFile(typeDeclaration.name, run),
                context: this.context,
            });
        }
    }

    private async withTypeDeclartionFile(
        typeDeclarationName: DeclaredTypeName | ErrorName,
        run: (file: File) => void | Promise<void>
    ) {
        return this.withFile({
            filepath: getExportedFilepathForType(typeDeclarationName),
            run,
        });
    }

    private async generateErrorDeclarations() {
        for (const errorDeclaration of this.intermediateRepresentation.errors) {
            await ErrorDeclarationHandler.run(errorDeclaration, {
                withFile: async (run) => this.withTypeDeclartionFile(errorDeclaration.name, run),
                context: this.context,
            });
        }
    }

    private async generateServiceDeclarations() {
        for (const serviceDeclaration of this.intermediateRepresentation.services.http) {
            await ServiceDeclarationHandler.run(serviceDeclaration, {
                withFile: async (run) => {
                    await this.withFile({
                        filepath: getExportedFilepathForService(serviceDeclaration.name),
                        run,
                    });
                },
                context: this.context,
            });
        }
    }

    private async generateClientFile() {
        await this.withFile({
            filepath: {
                directories: [],
                file: {
                    nameOnDisk: "/client.ts",
                    exportDeclaration: { namespaceExport: this.apiName },
                },
            },
            run: (file) => {
                writeClientFile(this.intermediateRepresentation, file);
                file.sourceFile.addExportDeclaration({
                    moduleSpecifier: getRelativePathAsModuleSpecifierTo(file.sourceFile, ROOT_API_DIRECTORY),
                });
            },
        });
    }

    private async withFile({
        run,
        filepath,
    }: {
        run: (file: File) => void | Promise<void>;
        filepath: ExportedFilePath;
    }) {
        const filepathStr = convertExportedFilePathToFilePath(filepath);
        this.context.logger.info(`Generating ${filepathStr}`);

        this.exportsManager.addExportsForFilepath(filepath);

        const sourceFile = this.rootDirectory.createSourceFile(filepathStr);

        const importsManager = new ImportsManager();
        const addDependency = (name: string, version: string, options?: { preferPeer?: boolean }) => {
            this.dependencyManager.addDependency(name, version, options);
        };

        const file: File = {
            sourceFile,
            getReferenceToType: (typeReference) =>
                getReferenceToType({
                    apiName: this.apiName,
                    referencedIn: sourceFile,
                    typeReference,
                    addImport: (moduleSpecifier, importDeclaration) =>
                        importsManager.addImport(moduleSpecifier, importDeclaration),
                }),
            getReferenceToService: (serviceName) =>
                getReferenceToService({
                    referencedIn: sourceFile,
                    apiName: this.apiName,
                    serviceName,
                    addImport: (moduleSpecifier, importDeclaration) =>
                        importsManager.addImport(moduleSpecifier, importDeclaration),
                }),
            resolveTypeReference: (typeReference) => this.typeResolver.resolveTypeReference(typeReference),
            getErrorDeclaration: (errorName) => this.errorResolver.getErrorDeclarationFromName(errorName),
            getReferenceToError: (errorName) =>
                getReferenceToExportedType({
                    apiName: this.apiName,
                    referencedIn: sourceFile,
                    typeName: getGeneratedTypeName(errorName),
                    exportedFromPath: getExportedFilepathForType(errorName),
                    addImport: (moduleSpecifier, importDeclaration) =>
                        importsManager.addImport(moduleSpecifier, importDeclaration),
                }),
            externalDependencies: createExternalDependencies({
                addDependency,
                addImport: (moduleSpecifier, importDeclaration) =>
                    importsManager.addImport(moduleSpecifier, importDeclaration),
            }),
            addDependency,
            fernConstants: this.intermediateRepresentation.constants,
        };

        await run(file);

        importsManager.writeImportsToSourceFile(sourceFile);
    }
}