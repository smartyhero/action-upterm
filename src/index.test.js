jest.mock('@actions/core');
import * as core from "@actions/core"

jest.mock("fs", () => ({
  mkdirSync: () => true,
  existsSync: () => true,
  appendFileSync: () => true
}));
jest.mock('./helpers');
import { execShellCommand } from "./helpers"
import { run } from "."

describe('upterm GitHub integration', () => {
  const originalPlatform = process.platform;

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    })
  });

  it('should skip for windows', async () => {
    Object.defineProperty(process, "platform", {
      value: "win32"
    })
    await run()
    expect(core.info).toHaveBeenCalledWith('Windows is not supported by upterm, skipping...');
  });
  it('should handle the main loop', async () => {
    Object.defineProperty(process, "platform", {
      value: "linux"
    })
    core.getInput.mockReturnValue("true")
    const customConnectionString = "foobar"
    execShellCommand.mockReturnValue(Promise.resolve(customConnectionString))
    await run()
    expect(execShellCommand).toHaveBeenNthCalledWith(1, "brew install owenthereal/upterm/upterm")
    expect(core.info).toHaveBeenNthCalledWith(1, `${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(2, "Exiting debugging session because '/continue' file was created");
  });
});