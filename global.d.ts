declare global {
  const titlebar: {
    close: () => void;
    maximize: () => void;
    minimize: () => void;
    isMaximised: () => Promise<boolean>;
  };
}

export default global;
