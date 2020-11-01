const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;
const originalFetch = window.fetch || fetch;

const listeners = new Set();

window.fetch = interceptedFetch;
XMLHttpRequest.prototype.open = interceptedOpen;
XMLHttpRequest.prototype.send = interceptedSend;

// url could be Request instance
function interceptedFetch(url, options) {
    for(let listener of listeners) {
        // TODO: Apply listener, and based on response create response
        // Or given a lack of response, call next listener
    }

    return originalFetch.call(this, url, options);
};

function interceptedOpen(...args) {
    const [method, url, async=true, username, password] = args;
    this.intercepted = {
        method,
        url,
        async,
        username, 
        password
    };

    originalOpen.apply(this, args);
};

function interceptedSend(body) {
    this.intercepted.body = body;

    const originalChange = this.onreadystatechange;
    this.onreadystatechange = function(...args) {
        originalChange && originalChange.apply(this, args);
    };

    for(let listener of listeners) {
        // TODO: Apply listener, and based on response create response
        // Or given a lack of response, call next listener
    }

    return originalSend.call(this, body);
}

export const subscribe = (listener) => {
    listeners.add(listener);
    return () => unsubscribe(listener);
};

export const unsubscribe = (listener) => {
    listeners.delete(listener);
}
