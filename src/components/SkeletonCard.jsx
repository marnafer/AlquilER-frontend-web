import React from 'react';

function SkeletonCard() {
    return (
        <article className="propiedad-card skeleton-card">
            <div className="propiedad-img-container skeleton skeleton-img" />
            <div className="propiedad-contenido">
                <div className="skeleton skeleton-line" style={{ width: '70%', height: '18px' }} />
                <div className="skeleton skeleton-line" style={{ width: '45%', height: '14px' }} />
                <div className="skeleton skeleton-line" style={{ width: '90%' }} />
                <div className="skeleton skeleton-line" style={{ width: '60%' }} />
                <div className="propiedad-footer" style={{ marginTop: '16px' }}>
                    <div className="skeleton skeleton-line" style={{ width: '40%', height: '16px' }} />
                    <div className="skeleton skeleton-line" style={{ width: '30%', height: '36px', borderRadius: '8px' }} />
                </div>
            </div>
        </article>
    );
}

export default SkeletonCard;