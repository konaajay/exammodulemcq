import React from 'react';

const FormInput = React.forwardRef(({ label, type = 'text', error, ...props }, ref) => {
    return (
        <div className="mb-3">
            {label && (
                <label className="form-label fw-medium text-dark mb-1">
                    {label}
                </label>
            )}
            <input
                type={type}
                ref={ref}
                className={`form-control ${error ? 'is-invalid' : ''}`}
                {...props}
            />
            {error && (
                <div className="invalid-feedback">{error.message}</div>
            )}
        </div>
    );
});

FormInput.displayName = 'FormInput';

export default FormInput;
