npm i
npm run build
cd ../jupyterlab
jlpm run remove:package jupyterlab-celltags
jlpm run add:sibling ../jupyterlab-celltags
jlpm run build
cd ../jupyterlab-celltags

