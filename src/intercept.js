import {
    getReasonPhrase
} from 'http-status-codes';

const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;
const originalFetch = window.fetch || fetch;

const listeners = new Set();
export const DEFAULT_RESULT = {
    status: 200,
    headers: {},
    body: '',
    delay: 0
};

window.fetch = interceptedFetch;
XMLHttpRequest.prototype.open = interceptedOpen;
XMLHttpRequest.prototype.send = interceptedSend;

// url could be Request instance
function interceptedFetch(url, options) {
    for(let listener of listeners) {
        let result = listener(request);
        if (result) {
            return;
        }
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

// TODO: Support non-async requests
async function interceptedSend(body) {
    this.intercepted.body = body;

    const originalLoad = this.onload;
    const originalChange = this.onreadystatechange;
    function injectedOnLoad(...args) {
        originalLoad && originalLoad.apply(this, args);
    }
    function injectedOnChange(...args) {
        originalChange && originalChange.apply(this, args);
    }

    // TODO: Eventually support headers, body, and other properties
    let request = {
        url: this.intercepted.url,
        method: this.intercepted.method
    };

    for(let listener of listeners) {
        let result = listener(request);
        if (result) {
            result = { ...DEFAULT_RESULT, ...result };
            setTimeout(() => {
                overrideValue(this, 'readyState', XMLHttpRequest.HEADERS_RECEIVED);
                this.getAllResponseHeaders = getAllResponseHeaders.bind(this, result.headers);
                this.getResponseHeader = getResponseHeader.bind(this, result.headers);
                injectedOnChange.call(this);

                this.readyState = XMLHttpRequest.LOADING;
                injectedOnChange.call(this);

                this.readyState = XMLHttpRequest.DONE;
                overrideValue(this, 'status', result.status);
                overrideValue(this, 'statusText', getReasonPhrase(this.status));
                // TODO: Support multiple response types
                overrideValue(this, 'response', JSON.stringify(result.body));
                overrideValue(this, 'responseText', this.response);
                injectedOnChange.call(this);
                
                injectedOnLoad.call(this);
            }, result.delay);
            return;
        }
    }

    return originalSend.call(this, body);
}

function overrideValue(object, param, value) {
    Object.defineProperty(object, param, {
        value,
        configurable: true,
        writable: true
    });
}

function getAllResponseHeaders(headers) {
    let responseHeaders = '';
    for( let [key, value] of Object.entries(headers) ) {
        responseHeaders += `${key.toLowerCase()}: ${value.toLowerCase()}\r\n`;
    }
    return responseHeaders;
}

function getResponseHeader(headers, name) {
    name = name.toLowerCase();
    return headers[name];
}

export const subscribe = (listener) => {
    listeners.add(listener);
    return () => unsubscribe(listener);
};

export const unsubscribe = (listener) => {
    listeners.delete(listener);
}
