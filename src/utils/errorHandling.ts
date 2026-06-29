export class WebContainerError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'WebContainerError';
  }
}

export class AIError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIError';
  }
}

export const ErrorMessages: { [key: string]: string } = {
  WEBCONTAINER_BOOT_FAILED: 'Failed to initialize WebContainer. Please refresh the page.',
  WEBCONTAINER_NOT_READY: 'WebContainer is not ready. Please wait and try again.',
  FILE_WRITE_FAILED: 'Failed to write file. Please try again.',
  FILE_READ_FAILED: 'Failed to read file.',
  COMMAND_EXECUTION_FAILED: 'Command execution failed.',
  AI_REQUEST_FAILED: 'AI request failed. Please check your API key and try again.',
  INVALID_FILE_PATH: 'Invalid file path.',
};

export function handleError(error: unknown): { message: string; code: string } {
  if (error instanceof WebContainerError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof AIError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }
  return { message: 'An unknown error occurred', code: 'UNKNOWN_ERROR' };
}
