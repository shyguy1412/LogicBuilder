#!/bin/bash

cd logic-circuit-engine
wasm-pack build --target web --out-dir ../lce-ts-bindings/pkg --features wasm
cd ..