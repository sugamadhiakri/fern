import execa from "execa";
import { mkdir, readFile, rm } from "fs/promises";
import path from "path";

const GENERATED_DIR = path.join(__dirname, "generated");
const GENERATED_API_DIR = path.join(GENERATED_DIR, "api");

describe("fern generate tests", () => {
    it("fern inits", async () => {
        await rm(GENERATED_DIR, { force: true, recursive: true });
        await mkdir(GENERATED_DIR);
        const cmd = execa("node", ["../../../../cli", "init"], {
            env: {
                NODE_ENV: "development",
            },
            cwd: GENERATED_DIR,
        });
        cmd.stdout?.pipe(process.stdout);
        cmd.stderr?.pipe(process.stderr);
        await cmd;
        await matchAgainstSnapshot(path.join(GENERATED_API_DIR, ".fernrc.yml"));
        await matchAgainstSnapshot(path.join(GENERATED_API_DIR, "src", "blog.yml"));
    }, 10_000);
});

async function matchAgainstSnapshot(filepath: string) {
    const fileContents = await readFile(filepath);
    expect(fileContents.toString()).toMatchSnapshot();
}