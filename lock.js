export let lock = { isLocked: false };

export const waitForUnlock = async () => {
  while (lock.isLocked) {
    await new Promise((resolve) => setTimeout(resolve, 10)); // ждём, пока файл освободится
  }
};
