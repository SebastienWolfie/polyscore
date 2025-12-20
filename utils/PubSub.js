class Pubsub { 
    constructor() {
      this._events = {};
    }
  
    on(event, listener) {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(listener);
      return () => {
        this._events[event] = this._events[event]
          .filter(fn => fn !== listener);
      };
    }
  
    publish(event, ...args) {
      if (!this._events[event]) {
        return;
      }
      this._events[event].forEach(listener => {
        listener(...args);
      });
    }
  }


  export default Pubsub;