import { compile } from "@fern-api/compiler";
import { writeFiles } from "@fern-api/typescript-commons";
import { parseFernDirectory } from "fern-api";
import { rm } from "fs/promises";
import { vol } from "memfs";
import path from "path";
import { Project } from "ts-morph";
import { generateErrorFiles } from "../generateErrors";
import { generateModelFiles } from "../generateModel";

const MOCK_APIS_DIR = path.join(__dirname, "mocks");
const GENERATED_DIR = path.join(__dirname, "generated");

beforeAll(async () => {
    await rm(GENERATED_DIR, { recursive: true, force: true });
});

describe("model", () => {
    it("posts", async () => {
        const directory = path.join(MOCK_APIS_DIR, "posts");
        const generatedDir = path.join(directory, "generated");

        const files = await parseFernDirectory(path.join(directory, "src"));
        const compilerResult = await compile(files);
        if (!compilerResult.didSucceed) {
            throw new Error(JSON.stringify(compilerResult.failure));
        }

        const project = new Project({
            useInMemoryFileSystem: true,
        });

        const modelDirectory = generateModelFiles({
            directory: project.createDirectory("src"),
            intermediateRepresentation: compilerResult.intermediateRepresentation,
        });
        generateErrorFiles({
            directory: project.createDirectory("src"),
            modelDirectory,
            intermediateRepresentation: compilerResult.intermediateRepresentation,
        });

        await writeFiles(generatedDir, project, vol.promises);
        expect(vol.toJSON()).toMatchSnapshot();

        await writeFiles(generatedDir, project);
    }, 15_000);

    it("fern IR", async () => {
        const directory = path.join(MOCK_APIS_DIR, "fern-ir");
        const generatedDir = path.join(directory, "generated");

        const files = await parseFernDirectory(path.join(directory, "src"));
        const compilerResult = await compile(files);
        if (!compilerResult.didSucceed) {
            throw new Error(JSON.stringify(compilerResult.failure));
        }

        const project = new Project({
            useInMemoryFileSystem: true,
        });

        generateModelFiles({
            directory: project.createDirectory("src"),
            intermediateRepresentation: compilerResult.intermediateRepresentation,
        });

        await writeFiles(generatedDir, project, vol.promises);
        expect(vol.toJSON()).toMatchSnapshot();

        await writeFiles(generatedDir, project);
    }, 60_000);
});