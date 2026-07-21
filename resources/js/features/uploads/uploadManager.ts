import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import GoldenRetriever from '@uppy/golden-retriever';

export function createGlobalUppy(tusEndpoint: string): Uppy {
    const instance = new Uppy({
        autoProceed: true,
        restrictions: {
            maxNumberOfFiles: 50,
            maxFileSize: 209715200,
            allowedFileTypes: null,
        },
    });

    instance.use(Tus, {
        endpoint: tusEndpoint,
        chunkSize: 5242880,
        retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
        withCredentials: true,
        removeFingerprintOnSuccess: true,
        limit: 2,
    });

    instance.use(GoldenRetriever, {
        serviceWorker: false,
    });

    return instance;
}
