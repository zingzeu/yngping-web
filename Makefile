VERSION_SUFFIX = v7

copy-assets:
	mkdir -p build/ && \
	cp index.html build/ && \
	mkdir -p build/static && \
	cp -rf static build/ && \
	cp wasm/* build/

clean:
	rm -rf build/

dev: copy-assets
	npm run dev

build : | clean copy-assets
	npm run build -- --env.ver=$(VERSION_SUFFIX) && \
	sed -i '' -e 's/src="main.js"/src="main.js?$(VERSION_SUFFIX)"/' ./build/index.html && \
	sed -i '' -e 's/rime_console.wasm/rime_console.wasm?$(VERSION_SUFFIX)/g' ./build/rime_console.js && \
	sed -i '' -e 's/rime_console.data/rime_console.data?$(VERSION_SUFFIX)/g' ./build/rime_console.js

.PHONY : build