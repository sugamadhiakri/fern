import { getPluginOutputConfig } from "../runPlugin";

describe("getPluginOutputConfig", () => {
    it("path relative to root", () => {
        const pluginOutputConfig = getPluginOutputConfig({
            absolutePathToProject: "/path/to/root",
            absolutePathToOutput: "/path/to/root/path/to/output",
        });
        expect(pluginOutputConfig.pathRelativeToRootOnHost).toEqual("path/to/output");
    });
    it("no path relative to root", () => {
        const pluginOutputConfig = getPluginOutputConfig({
            absolutePathToProject: undefined,
            absolutePathToOutput: "/path/to/root/path/to/output",
        });
        expect(pluginOutputConfig.pathRelativeToRootOnHost).toEqual(null);
    });
});