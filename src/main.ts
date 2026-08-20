import { createKernel } from "./v2/core/kernel";
import { BUILD_ID } from "./v2/runtime/build";

// This write happens as soon as Screeps evaluates the uploaded module.
// The tick-level write in ensureBotMemory() confirms that the kernel is running too.
Memory.lastModified = BUILD_ID;
const kernel = createKernel();

export function loop(): void {
  kernel.run();
}
