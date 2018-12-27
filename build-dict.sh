pushd ../yngping-rime
git reset --hard HEAD && \
git pull
popd

mkdir -p ../librime/data/yngping/ && \
cp -rf ../yngping-rime/Fuzhou.*.yaml ../librime/data/yngping && \
pushd ../librime && \
docker run --rm -it -v $PWD/:/root/workspace wasm bash -c "source ~/.bashrc; cd ./wasm/example && ./compile.sh ../../data/yngping" && \
popd && \
cp -rf ../librime/wasm/example/rime_console.*{js,data,wasm} ./wasm
