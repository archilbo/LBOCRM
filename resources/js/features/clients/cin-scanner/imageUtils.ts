export const CIN_IMAGE_MAX_BYTES =
    15 * 1024 * 1024;

export const CIN_IMAGE_ACCEPT =
    'image/jpeg,image/png,image/webp';

const ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

export type CinClientImageInfo = {
    width: number;
    height: number;
    warnings: string[];
    isUsable: boolean;
};

export async function inspectCinImage(
    file: File,
): Promise<CinClientImageInfo> {
    if (! ALLOWED_TYPES.has(file.type)) {
        throw new Error(
            'Utilisez une image JPEG, PNG ou WEBP.',
        );
    }

    if (file.size > CIN_IMAGE_MAX_BYTES) {
        throw new Error(
            'L\'image ne doit pas dépasser 15 Mo.',
        );
    }

    const dimensions = await readImageDimensions(file);
    const longSide = Math.max(
        dimensions.width,
        dimensions.height,
    );
    const shortSide = Math.min(
        dimensions.width,
        dimensions.height,
    );
    const warnings: string[] = [];

    if (longSide < 1200 || shortSide < 700) {
        warnings.push('Résolution faible');
    }

    if (longSide < 600 || shortSide < 350) {
        warnings.push('Image trop petite');
    }

    return {
        ...dimensions,
        warnings,
        isUsable:
            longSide >= 600
            && shortSide >= 350,
    };
}

export async function rotateCinImage(
    file: File,
    degrees: 90 | -90,
): Promise<File> {
    const image = await loadHtmlImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalHeight;
    canvas.height = image.naturalWidth;
    const context = canvas.getContext('2d');

    if (! context) {
        throw new Error(
            'La rotation de l\'image a échoué.',
        );
    }

    context.translate(
        canvas.width / 2,
        canvas.height / 2,
    );
    context.rotate(
        degrees * Math.PI / 180,
    );
    context.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2,
    );

    const outputType = ALLOWED_TYPES.has(file.type)
        ? file.type
        : 'image/jpeg';
    const blob = await new Promise<Blob>(
        (resolve, reject) => {
            canvas.toBlob(
                (nextBlob) => {
                    if (nextBlob) {
                        resolve(nextBlob);
                    } else {
                        reject(new Error(
                            'La rotation de l\'image a échoué.',
                        ));
                    }
                },
                outputType,
                0.94,
            );
        },
    );

    return new File(
        [blob],
        file.name,
        {
            type: outputType,
            lastModified: Date.now(),
        },
    );
}

async function readImageDimensions(
    file: File,
): Promise<{
    width: number;
    height: number;
}> {
    if ('createImageBitmap' in window) {
        const bitmap = await createImageBitmap(file);
        const dimensions = {
            width: bitmap.width,
            height: bitmap.height,
        };
        bitmap.close();

        return dimensions;
    }

    const image = await loadHtmlImage(file);

    return {
        width: image.naturalWidth,
        height: image.naturalHeight,
    };
}

function loadHtmlImage(
    file: File,
): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(
                'L\'image sélectionnée est invalide.',
            ));
        };

        image.src = url;
    });
}
