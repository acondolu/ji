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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   call: () => (/* binding */ call),\n/* harmony export */   error: () => (/* binding */ error),\n/* harmony export */   exit: () => (/* binding */ exit),\n/* harmony export */   hello: () => (/* binding */ hello),\n/* harmony export */   log: () => (/* binding */ log)\n/* harmony export */ });\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nconst VERSION = 0;\nclass Foreign {\n    constructor() {\n        var _a, _b, _c, _d, _e, _f;\n        this.rpc_no = 0;\n        this.postMessage = (value) => {\n            var _a, _b, _c;\n            return (_c = (_b = (_a = window.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.nativeCallback) === null || _c === void 0 ? void 0 : _c.postMessage(value);\n        };\n        if (!((_c = (_b = (_a = window.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.nativeCallback) === null || _c === void 0 ? void 0 : _c.postMessage)) {\n            throw Error(\"Unsupported: window.webkit.messageHandlers.nativeCallback.postMessage\");\n        }\n        this.remoteLog = (message) => {\n            var _a, _b, _c;\n            return (_c = (_b = (_a = window.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.nativeLogger) === null || _c === void 0 ? void 0 : _c.postMessage(message);\n        };\n        if (!((_f = (_e = (_d = window.webkit) === null || _d === void 0 ? void 0 : _d.messageHandlers) === null || _e === void 0 ? void 0 : _e.nativeLogger) === null || _f === void 0 ? void 0 : _f.postMessage)) {\n            throw Error(\"Unsupported: window.webkit.messageHandlers.nativeLogger.postMessage\");\n        }\n        if (!FinalizationRegistry) {\n            throw Error(\"Unsupported: FinalizationRegistry\");\n        }\n        this.ffi_registry = new FinalizationRegistry((id) => __awaiter(this, void 0, void 0, function* () {\n            yield this.call({ free: { id } });\n        }));\n        this.rpcs = new Map();\n    }\n    // private alloc(id: number, value: any) {\n    //   this.ffi_registry.register(value, id);\n    // }\n    /**\n     * Process a command sent from the native app.\n     */\n    recv(cmd) {\n        this.log(`recv(${JSON.stringify(cmd)})`);\n        const { key, value } = tag(cmd);\n        switch (key) {\n            case \"ret\": {\n                const { _id, contents } = value;\n                this.recvRet(_id, contents);\n                break;\n            }\n            case \"call\": {\n                const { _id, contents } = value;\n                const ret = this.runBrowserAction(contents);\n                this.ret(_id, ret);\n            }\n        }\n    }\n    recvRet(_id, contents) {\n        const resolve = (value) => {\n            var _a;\n            const resolve = (_a = this.rpcs.get(_id)) === null || _a === void 0 ? void 0 : _a.resolve;\n            if (resolve) {\n                this.rpcs.delete(_id);\n                resolve(value);\n            }\n        };\n        const reject = (reason) => {\n            var _a;\n            const reject = (_a = this.rpcs.get(_id)) === null || _a === void 0 ? void 0 : _a.reject;\n            if (reject) {\n                this.rpcs.delete(_id);\n                reject(reason);\n            }\n        };\n        const { key, value } = tag(contents);\n        switch (key) {\n            case \"Void\":\n                return resolve(undefined);\n            case \"RetInt\":\n                return resolve(value.n);\n            case \"Null\":\n                return resolve(null);\n            case \"RetError\":\n                return reject(Error(value.reason));\n            case \"String\":\n                return resolve(value.s);\n            case \"Float\":\n                return resolve(value.f);\n            case \"RetBool\":\n                return resolve(value.b);\n            default:\n                this.log(`recvRet: unknown command: ${JSON.stringify(contents)}`);\n        }\n    }\n    /**\n     * Implements the browser actions that can be called from the native app.\n     */\n    runBrowserAction(action) {\n        const { key, value } = tag(action);\n        switch (key) {\n            case \"alert\":\n                alert(value.message);\n                return { Void: {} };\n            default:\n                return {\n                    RetError: {\n                        reason: `Unknwon browser action: ${JSON.stringify(action)}.`,\n                    },\n                };\n        }\n    }\n    call(action) {\n        this.rpc_no = this.rpc_no + 1;\n        const _id = this.rpc_no;\n        return new Promise((resolve, reject) => {\n            this.rpcs.set(_id, { resolve, reject });\n            this.send({ call: { _id, contents: action } });\n        });\n    }\n    ret(_id, contents) {\n        return this.send({ ret: { _id, contents } });\n    }\n    send(cmd) {\n        this.log(JSON.stringify(cmd));\n        return this.postMessage(JSON.stringify(cmd));\n    }\n    log(message) {\n        return this.remoteLog(message);\n    }\n    hello() {\n        document.addEventListener(\"jirecv\", (e) => {\n            this.log(`XrecvX ${e}`);\n            this.recv(e.detail);\n        }, false);\n        return this.call({ hello: { version: VERSION } });\n    }\n}\nlet foreign = mkForeign();\nlet error = null;\nfunction mkForeign() {\n    try {\n        return new Foreign();\n    }\n    catch (e) {\n        error = e;\n        return null;\n    }\n}\nfunction withForeign(act) {\n    if (foreign) {\n        return act(foreign);\n    }\n    else {\n        return Promise.reject(new Error(`ji: not available (${error.toString()})`));\n    }\n}\nfunction hello() {\n    return withForeign((foreign) => foreign.hello());\n}\nfunction exit(code = 0) {\n    return withForeign((foreign) => foreign.call({ exit: { code } }));\n}\nfunction log(message) {\n    if (foreign)\n        foreign.log(message);\n}\nfunction call(action) {\n    return withForeign((foreign) => foreign.call(action));\n}\nfunction tag(obj) {\n    const keys = Object.getOwnPropertyNames(obj);\n    if (keys.length > 0) {\n        const key = keys[0];\n        return {\n            key,\n            value: obj[key],\n        };\n    }\n    return null;\n}\n\n\n//# sourceURL=webpack://ji/./src/Foreign.ts?");

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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   UIDevice: () => (/* binding */ UIDevice),\n/* harmony export */   current: () => (/* binding */ current)\n/* harmony export */ });\n/* harmony import */ var _ObjectiveC_NSObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ObjectiveC/NSObject */ \"./src/ObjectiveC/NSObject.ts\");\n/* harmony import */ var _Foreign__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Foreign */ \"./src/Foreign.ts\");\n// https://developer.apple.com/documentation/uikit/uidevice\n\n\n/**\n * A representation of the current device.\n */\nclass UIDevice extends _ObjectiveC_NSObject__WEBPACK_IMPORTED_MODULE_0__.NSObject {\n    constructor() {\n        super(...arguments);\n        // Getting the device battery state\n        /**\n         * A Boolean value that indicates whether battery monitoring is enabled.\n         */\n        this.isBatteryMonitoringEnabled = {\n            set(value) {\n                return (0,_Foreign__WEBPACK_IMPORTED_MODULE_1__.call)({ \"UIKit_UIDevice_current_isBatteryMonitoringEnabled_set\": { value } });\n            },\n        };\n    }\n    /**\n     * The model of the device.\n     */\n    get model() {\n        return (0,_Foreign__WEBPACK_IMPORTED_MODULE_1__.call)({ \"UIKit_UIDevice_current_model_get\": {} });\n    }\n    /**\n     * The battery charge level for the device.\n     */\n    get batteryLevel() {\n        return (0,_Foreign__WEBPACK_IMPORTED_MODULE_1__.call)({ \"UIKit_UIDevice_current_batteryLevel_get\": {} });\n    }\n}\nconst current = new UIDevice();\n// Make UIDevice unconstructable (breaks the TS contract)\ndelete UIDevice.prototype.constructor;\n\n\n//# sourceURL=webpack://ji/./src/UIKit/UIDevice.ts?");

/***/ }),

/***/ "./src/lib.ts":
/*!********************!*\
  !*** ./src/lib.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Foreign__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Foreign */ \"./src/Foreign.ts\");\n/* harmony import */ var _UIKit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UIKit */ \"./src/UIKit.ts\");\n\n\nconst ji = {\n    /**\n     * Begin handshake with native app.\n     * Will exchange and compare the version numbers.\n     */\n    hello: _Foreign__WEBPACK_IMPORTED_MODULE_0__.hello,\n    /**\n     * Print a message into native app's stdout.\n     */\n    log: _Foreign__WEBPACK_IMPORTED_MODULE_0__.log,\n    /**\n     * Exit the app with given error code.\n     */\n    exit: _Foreign__WEBPACK_IMPORTED_MODULE_0__.exit,\n    UIKit: _UIKit__WEBPACK_IMPORTED_MODULE_1__[\"default\"],\n};\nwindow[\"ji\"] = ji;\n\n\n//# sourceURL=webpack://ji/./src/lib.ts?");

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