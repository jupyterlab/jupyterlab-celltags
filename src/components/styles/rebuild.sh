cd ..
cd jupyterlab-celltags
npm run build
jupyter labextension unlink .
jupyter labextension link .
cd ..
cd jupyterlab
jupyter lab build
jupyter lab