import { assertNever } from "@fern-api/core-utils";
import { constructFernFileContext, ResolvedType, TypeResolver, TypeResolverImpl } from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import {
    DefinitionFileSchema,
    isRawDiscriminatedUnionDefinition,
    isRawEnumDefinition,
    isRawObjectDefinition,
    isRawUndiscriminatedUnionDefinition,
} from "@fern-api/yaml-schema";
import { RuleRunnerArgs } from "./Rule";
import { CASINGS_GENERATOR } from "./utils/casingsGenerator";

export class ComplexTypeDetector {
    private typeResolver: TypeResolver;

    constructor(private readonly workspace: FernWorkspace) {
        this.typeResolver = new TypeResolverImpl(workspace);
    }

    public isTypeComplex(type: string, ruleRunnerArgs: RuleRunnerArgs<DefinitionFileSchema>): boolean | undefined {
        const resolvedType = this.typeResolver.resolveType({
            type,
            file: constructFernFileContext({
                relativeFilepath: ruleRunnerArgs.relativeFilepath,
                definitionFile: ruleRunnerArgs.contents,
                casingsGenerator: CASINGS_GENERATOR,
                rootApiFile: this.workspace.definition.rootApiFile.contents,
            }),
        });
        if (resolvedType == null) {
            return undefined;
        }
        return this.isResolvedReferenceComplex(resolvedType);
    }

    private isResolvedReferenceComplex(type: ResolvedType): boolean {
        switch (type._type) {
            case "container":
                return type.container._type !== "optional" || this.isResolvedReferenceComplex(type.container.itemType);
            case "named":
                return this.isNamedTypeComplex(type);
            case "primitive":
                return false;
            case "unknown":
                return true;
        }
    }

    private isNamedTypeComplex(type: ResolvedType.Named): boolean {
        if (
            isRawObjectDefinition(type.declaration) ||
            isRawDiscriminatedUnionDefinition(type.declaration) ||
            isRawUndiscriminatedUnionDefinition(type.declaration)
        ) {
            return true;
        }
        if (isRawEnumDefinition(type.declaration)) {
            return false;
        }
        assertNever(type.declaration);
    }
}
