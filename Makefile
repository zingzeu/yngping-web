copy-assets:
	mkdir -p build/ && \
	cp index.html build/

clean:
	rm -rf dist/

dev: copy-assets
	npm run dev