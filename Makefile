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
	npm run build

.PHONY : build