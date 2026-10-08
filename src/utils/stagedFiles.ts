/**
 * Hand-off between the home screen and the tools.
 * The home drop area stages files here; the next FileDropzone that mounts
 * consumes them, so the user never has to pick the same file twice.
 */
let staged: File[] | null = null;

export const stageFiles = (files: File[]) => {
  staged = files;
};

export const takeStagedFiles = (): File[] | null => {
  const files = staged;
  staged = null;
  return files;
};