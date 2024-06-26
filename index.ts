import * as core from '@actions/core';
import * as io from '@actions/io';
import * as tc from "@actions/tool-cache";
import path from 'path';

async function run() {
    try {
        await getTask();
    } catch (error) {
        console.error(error);
        if (error instanceof Error)
        core.setFailed(error.message);
    }
}

async function downloadRelease(): Promise<string> {

    const downloadUrl: string = "https://github.com/go-task/task/releases/download/3.37.2/task_linux_amd64.tar.gz";
    let downloadPath: string | null = null;
    try {
      downloadPath = await tc.downloadTool(downloadUrl);
    } catch (error) {
      if (typeof error === "string" || error instanceof Error) {
        core.debug(error.toString());
      }
      throw new Error('Failed to download taskfile');
    }
  
    // Extract
    let extPath: string | null = null;

    extPath = await tc.extractTar(downloadPath);
    // Create a bin/ folder and move `task` there
    await io.mkdirP(path.join(extPath, "bin"));
    await io.mv(path.join(extPath, "task"), path.join(extPath, "bin"));
    
  
    // Install into the local tool cache - node extracts with a root folder that matches the fileName downloaded
    return tc.cacheDir(extPath, "task", '3.37.2');
  }

async function getTask() {

    let toolPath = await downloadRelease();

    toolPath = path.join(toolPath, "bin");
    core.addPath(toolPath);
    core.info(`Successfully setup Taskfile`);
}

run();