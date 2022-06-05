import React, { Component, useState } from "react";
import Select, { components } from "react-select";
import styled from "styled-components";

const Label = styled.label<{ isFloating?: boolean }>`
  left: 10px;
  pointer-events: none;
  position: absolute;
  transition: 0.2s ease all;
  -moz-transition: 0.2s ease all;
  -webkit-transition: 0.2s ease all;

  top: ${(props) => (props.isFloating ? `5px` : `35%`)};
  font-size: ${(props) => (props.isFloating ? `0.5rem` : `1rem`)};
`;

export function Dropdown({ options, handler, label }) {
  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: 250,
    }),
  };

  const Control = (props: any) => {
    return (
      <>
        <Label
          style={{ zIndex: 100 }}
          isFloating={props.isFocused || props.hasValue}
        >
          {label}
        </Label>
        <components.Control {...props} />
      </>
    );
  };
  return (
    <Select
      onChange={(e: any) => {
        handler(e.value);
      }}
      placeholder=""
      options={options}
      styles={customStyles}
      components={{ Control }}
    />
  );
}
