const bus = ref(new Map());

export default function useEventBus() {
  function emit(event, ...args) {
    bus.value.set(event, args);
  }

  return {
    emit,
    bus,
  };
}

// export default function useEmitter() {
//     const internalInstance = getCurrentInstance();
//     const emitter = internalInstance.appContext.config.globalProperties.emitter;
//     return emitter;
// }
