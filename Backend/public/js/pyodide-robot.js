let pyodide = null;

async function loadPyodideAndPackages() {
  if (pyodide) return;
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
  });
}

async function jalankanPython(kode) {
  if (!pyodide) throw new Error('Pyodide belum siap');
  let output = '';
  pyodide.setStdout({
    batched: (data) => {
      output += data;
    },
  });
  pyodide.setStderr({
    batched: (data) => {
      output += data;
    },
  });

  try {
    await pyodide.runPythonAsync(kode);
  } catch (err) {
    output += err.toString();
  }
  return output;
}

// Expose function global untuk React bisa akses
window.loadPyodideAndPackages = loadPyodideAndPackages;
window.jalankanPython = jalankanPython;
