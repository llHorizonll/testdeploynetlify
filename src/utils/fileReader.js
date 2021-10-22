export const ToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result);
    //reader.onload = () => resolve(String.fromCharCode.apply(null, new Uint8Array(reader.result)));
    // reader.onload = () => resolve(reader.result.replace("data:", "").replace(/^.+,/, ""));
    reader.onerror = (error) => reject(error);
  });
};

export default { ToBase64 };
