class SnackbarUtils {
  #snackBar = {
    enqueueSnackbar: () => {},
    closeSnackbar: () => {},
  };

  setSnackBar(enqueueSnackbar, closeSnackbar) {
    this.#snackBar.enqueueSnackbar = enqueueSnackbar;
    this.#snackBar.closeSnackbar = closeSnackbar;
  }

  success(msg, options = {}) {
    return this.toast(msg, { ...options, variant: "success", autoHideDuration: 3000 });
  }
  warning(msg, options = {}) {
    return this.toast(msg, { ...options, variant: "warning", autoHideDuration: 3000 });
  }
  info(msg, options = {}) {
    return this.toast(msg, { ...options, variant: "info", autoHideDuration: 3000 });
  }
  error(msg, options = {}) {
    return this.toast(msg, { ...options, variant: "error", autoHideDuration: 3000 });
  }
  toast(msg, options = {}) {
    const finalOptions = {
      variant: "default",
      ...options,
    };
    return this.#snackBar.enqueueSnackbar(msg, { ...finalOptions });
  }
  closeSnackbar(key) {
    this.#snackBar.closeSnackbar(key);
  }
}

export default new SnackbarUtils();
