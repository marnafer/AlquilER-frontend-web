import { useEffect, useState } from 'react';

function PropiedadCardImage({ src, alt }) {
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [src]);

    if (!src || imgError) {
        return (
            <div className="propiedad-placeholder" role="img" aria-label={alt || 'Imagen no disponible'}>
                <i className="fas fa-house" aria-hidden="true"></i>
                <span>Imagen no disponible</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
        />
    );
}

export default PropiedadCardImage;
