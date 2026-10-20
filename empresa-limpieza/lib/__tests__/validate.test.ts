import { describe, expect, it } from "vitest";
import { checkInInput, configInput, siteInput, userInput, ValidationError } from "../validate";

describe("siteInput", () => {
  it("normaliza y aplica default de radio", () => {
    expect(siteInput({ name: "  Escuela 1 ", lat: "-34.6", lng: "-58.4" })).toEqual({
      name: "Escuela 1",
      lat: -34.6,
      lng: -58.4,
      radius: 150,
    });
  });
  it("rechaza nombre corto, coordenadas y radio fuera de rango", () => {
    expect(() => siteInput({ name: "A", lat: 0, lng: 0 })).toThrow(ValidationError);
    expect(() => siteInput({ name: "Escuela", lat: 91, lng: 0 })).toThrow(/Latitud/);
    expect(() => siteInput({ name: "Escuela", lat: 0, lng: 181 })).toThrow(/Longitud/);
    expect(() => siteInput({ name: "Escuela", lat: 0, lng: 0, radius: 10 })).toThrow(/Radio/);
  });
});

describe("configInput", () => {
  it("permite vacíos y limita longitudes", () => {
    expect(configInput({ phone: "", email: "" })).toEqual({ phone: "", email: "" });
    expect(() => configInput({ phone: "1".repeat(21), email: "" })).toThrow(/WhatsApp/);
  });
});

describe("checkInInput", () => {
  it("aplica los rangos del schema (nombre 3-120, dni 4-20)", () => {
    expect(() => checkInInput({ name: "Al", dni: "12345", siteId: "x", lat: 0, lng: 0, acc: 5 })).toThrow(/Nombre/);
    expect(() => checkInInput({ name: "Ana", dni: "123", siteId: "x", lat: 0, lng: 0, acc: 5 })).toThrow(/DNI/);
    expect(checkInInput({ name: "Ana", dni: "1234", siteId: "x", lat: "1", lng: "2", acc: 5.6 })).toEqual({
      name: "Ana",
      dni: "1234",
      siteId: "x",
      lat: 1,
      lng: 2,
      acc: 6,
    });
  });
  it("rechaza body no objeto", () => {
    expect(() => checkInInput(null)).toThrow(ValidationError);
  });
});

describe("userInput", () => {
  it("baja a minúsculas y exige contraseña de 8", () => {
    expect(userInput({ email: " Ana@Test.com ", password: "12345678", name: "Ana" })).toEqual({
      email: "ana@test.com",
      password: "12345678",
      name: "Ana",
      isAdmin: false,
    });
    expect(() => userInput({ email: "ana@test.com", password: "1234567" })).toThrow(/8 caracteres/);
    expect(() => userInput({ email: "no-es-email", password: "12345678" })).toThrow(/Email inválido/);
  });
});
