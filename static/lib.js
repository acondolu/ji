/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Foreign.ts":
/*!************************!*\
  !*** ./src/Foreign.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   error: () => (/* binding */ error),\n/* harmony export */   exit: () => (/* binding */ exit),\n/* harmony export */   foreign: () => (/* binding */ foreign),\n/* harmony export */   hello: () => (/* binding */ hello),\n/* harmony export */   log: () => (/* binding */ log)\n/* harmony export */ });\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nconst VERSION = 0;\nclass Foreign {\n    constructor() {\n        var _a, _b, _c, _d, _e, _f;\n        this.rpc_no = 0;\n        this.postMessage = value => { var _a, _b, _c; return (_c = (_b = (_a = window.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.nativeCallback) === null || _c === void 0 ? void 0 : _c.postMessage(value); };\n        if (!((_c = (_b = (_a = window.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.nativeCallback) === null || _c === void 0 ? void 0 : _c.postMessage)) {\n            throw Error(\"Unsupported: window.webkit.messageHandlers.nativeCallback.postMessage\");\n        }\n        this.remoteLog = message => { var _a, _b, _c; return (_c = (_b = (_a = window.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.nativeLogger) === null || _c === void 0 ? void 0 : _c.postMessage(message); };\n        if (!((_f = (_e = (_d = window.webkit) === null || _d === void 0 ? void 0 : _d.messageHandlers) === null || _e === void 0 ? void 0 : _e.nativeLogger) === null || _f === void 0 ? void 0 : _f.postMessage)) {\n            throw Error(\"Unsupported: window.webkit.messageHandlers.nativeLogger.postMessage\");\n        }\n        if (!FinalizationRegistry) {\n            throw Error(\"Unsupported: FinalizationRegistry\");\n        }\n        this.ffi_registry = new FinalizationRegistry((id) => __awaiter(this, void 0, void 0, function* () {\n            yield this.call({ free: { id } });\n        }));\n        this.rpcs = new Map();\n    }\n    // private alloc(id: number, value: any) {\n    //   this.ffi_registry.register(value, id);\n    // }\n    /**\n     * Process a command sent from the native app.\n     */\n    recv(cmd) {\n        this.log(`recv(${JSON.stringify(cmd)})`);\n        if (\"ret\" in cmd) {\n            const { _id, contents } = cmd.ret;\n            this.recvRet(_id, contents);\n        }\n        else if (\"call\" in cmd) {\n            const { _id, contents } = cmd.call;\n            const ret = this.runBrowserAction(contents);\n            this.ret(_id, ret);\n        }\n    }\n    recvRet(_id, contents) {\n        const resolve = (value) => {\n            var _a;\n            const resolve = (_a = this.rpcs.get(_id)) === null || _a === void 0 ? void 0 : _a.resolve;\n            if (resolve) {\n                this.rpcs.delete(_id);\n                resolve(value);\n            }\n        };\n        const reject = (reason) => {\n            var _a;\n            const reject = (_a = this.rpcs.get(_id)) === null || _a === void 0 ? void 0 : _a.reject;\n            if (reject) {\n                this.rpcs.delete(_id);\n                reject(reason);\n            }\n        };\n        if (\"RetUndefined\" in contents) {\n            return resolve(undefined);\n        }\n        if (\"RetInt\" in contents) {\n            return resolve(contents.RetInt.n);\n        }\n        if (\"RetNull\" in contents) {\n            return resolve(null);\n        }\n        if (\"RetError\" in contents) {\n            return reject(Error(contents.RetError.reason));\n        }\n        if (\"String\" in contents) {\n            return resolve(contents.String.s);\n        }\n        if (\"Float\" in contents) {\n            return resolve(contents.Float.f);\n        }\n        if (\"RetBool\" in contents) {\n            return resolve(contents.RetBool.b);\n        }\n        this.log(`recvRet: unknown command: ${JSON.stringify(contents)}`);\n    }\n    /**\n     * Implements the browser actions that can be called from the native app.\n     */\n    runBrowserAction(action) {\n        if (\"alert\" in action) {\n            alert(action.alert.message);\n            return { Void: {} };\n        }\n        else {\n            return { RetError: { reason: `Unknwon browser action: ${JSON.stringify(action)}.` } };\n        }\n    }\n    call(action) {\n        this.rpc_no = this.rpc_no + 1;\n        const _id = this.rpc_no;\n        return new Promise((resolve, reject) => {\n            this.rpcs.set(_id, { resolve, reject });\n            this.send({ call: { _id, contents: action } });\n        });\n    }\n    ret(_id, contents) {\n        return this.send({ ret: { _id, contents } });\n    }\n    send(cmd) {\n        var _a, _b, _c;\n        this.log(JSON.stringify(cmd));\n        document.write((_c = (_b = (_a = window.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.nativeCallback) === null || _c === void 0 ? void 0 : _c.postMessage);\n        return this.postMessage(JSON.stringify(cmd));\n    }\n    log(message) {\n        return this.remoteLog(message);\n    }\n    hello() {\n        document.addEventListener(\"jirecv\", (e) => {\n            // this.log(`${e}`);\n            this.recv(e.detail);\n        }, false);\n        return this.call({ hello: { version: VERSION } });\n    }\n}\nlet error = null;\nfunction mkForeign() {\n    try {\n        return new Foreign();\n    }\n    catch (e) {\n        error = e;\n        return null;\n    }\n}\nconst foreign = mkForeign();\n/**\n * Begin handshake with native app.\n * Will exchange and compare the version numbers.\n */\nfunction hello() {\n    if (foreign) {\n        return foreign.hello();\n    }\n    else {\n        return Promise.reject(new Error(`ji: not available (${error.toString()})`));\n    }\n}\n// Supported native actions\n/**\n * Exit the app with given error code.\n */\nfunction exit(code = 0) {\n    return foreign.call({ exit: { code } });\n}\n/**\n * Print a message into native app's stdout.\n */\nfunction log(message) {\n    return foreign.log(message);\n}\n\n\n//# sourceURL=webpack://ji/./src/Foreign.ts?");

/***/ }),

/***/ "./src/ObjectiveC/NSObject.ts":
/*!************************************!*\
  !*** ./src/ObjectiveC/NSObject.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   NSObject: () => (/* binding */ NSObject)\n/* harmony export */ });\nclass NSObject {\n}\n\n\n//# sourceURL=webpack://ji/./src/ObjectiveC/NSObject.ts?");

/***/ }),

/***/ "./src/UIKit.ts":
/*!**********************!*\
  !*** ./src/UIKit.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _UIKit_UIDevice__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UIKit/UIDevice */ \"./src/UIKit/UIDevice.ts\");\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n    UIDevice: {\n        UIDevice: _UIKit_UIDevice__WEBPACK_IMPORTED_MODULE_0__.UIDevice,\n        current: _UIKit_UIDevice__WEBPACK_IMPORTED_MODULE_0__.current,\n    },\n});\n\n\n//# sourceURL=webpack://ji/./src/UIKit.ts?");

/***/ }),

/***/ "./src/UIKit/UIDevice.ts":
/*!*******************************!*\
  !*** ./src/UIKit/UIDevice.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   UIDevice: () => (/* binding */ UIDevice),\n/* harmony export */   current: () => (/* binding */ current)\n/* harmony export */ });\n/* harmony import */ var _ObjectiveC_NSObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ObjectiveC/NSObject */ \"./src/ObjectiveC/NSObject.ts\");\n/* harmony import */ var _Foreign__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Foreign */ \"./src/Foreign.ts\");\n// https://developer.apple.com/documentation/uikit/uidevice\n\n\n/**\n * A representation of the current device.\n */\nclass UIDevice extends _ObjectiveC_NSObject__WEBPACK_IMPORTED_MODULE_0__.NSObject {\n    constructor() {\n        super(...arguments);\n        // Getting the device battery state\n        /**\n         * A Boolean value that indicates whether battery monitoring is enabled.\n         */\n        this.isBatteryMonitoringEnabled = {\n            set(value) {\n                return _Foreign__WEBPACK_IMPORTED_MODULE_1__.foreign.call({ \"UIKit_UIDevice_current_isBatteryMonitoringEnabled_set\": { value } });\n            },\n        };\n    }\n    /**\n     * The model of the device.\n     */\n    get model() {\n        return _Foreign__WEBPACK_IMPORTED_MODULE_1__.foreign.call({ \"UIKit_UIDevice_current_model_get\": {} });\n    }\n    /**\n     * The battery charge level for the device.\n     */\n    get batteryLevel() {\n        return _Foreign__WEBPACK_IMPORTED_MODULE_1__.foreign.call({ \"UIKit_UIDevice_current_batteryLevel_get\": {} });\n    }\n}\nconst current = new UIDevice();\n// Make UIDevice unconstructable (breaks the TS contract)\ndelete UIDevice.prototype.constructor;\n\n\n//# sourceURL=webpack://ji/./src/UIKit/UIDevice.ts?");

/***/ }),

/***/ "./src/lib.ts":
/*!********************!*\
  !*** ./src/lib.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Foreign__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Foreign */ \"./src/Foreign.ts\");\n/* harmony import */ var _UIKit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UIKit */ \"./src/UIKit.ts\");\n/**\n * This is a sample main file.\n */\n\n\nconst ji = {\n    hello: _Foreign__WEBPACK_IMPORTED_MODULE_0__.hello,\n    log: _Foreign__WEBPACK_IMPORTED_MODULE_0__.log,\n    exit: _Foreign__WEBPACK_IMPORTED_MODULE_0__.exit,\n    UIKit: _UIKit__WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n};\nwindow['ji'] = ji;\n\n\n//# sourceURL=webpack://ji/./src/lib.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/lib.ts");
/******/ 	
/******/ })()
;