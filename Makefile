.PHONY = all build-native build-browser

all: build-browser build-native

build-native:
	xcodebuild -scheme ji build CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO

browser/node_modules: browser/package.json browser/package-lock.json
	cd browser && npm i

build-browser: browser/node_modules browser/src/*.ts
	cd browser && npm run build

.PHONY = clean clean-browser clean-native

clean-browser:
	rm -rf browser/node_modules

clean: clean-browser
