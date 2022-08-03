import React from 'react';

export default function Form({ methods, children, handleSubmit }) {
  const { register } = methods;

  return (
    <form onSubmit={handleSubmit}>
      {React.Children.map(children, (child) => {
        return child.props.name
          ? React.createElement(child.type, {
              ...{
                ...child.props,
                register,
                key: child.props.name,
              },
            })
          : child;
      })}
    </form>
  );
}
