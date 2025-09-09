"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  cpfCnpj?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
  loading?: boolean;
}

export function ShippingForm({ onSubmit, loading = false }: ShippingFormProps) {
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    cpfCnpj: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [saveData, setSaveData] = useState<boolean>(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout:address");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ShippingAddress>;
        setAddress((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!address.fullName.trim()) newErrors.fullName = "Nome é obrigatório";
    if (!address.phone.trim()) newErrors.phone = "Telefone é obrigatório";
    if (
      !address.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)
    )
      newErrors.email = "E-mail válido é obrigatório";
    if (!address.street.trim()) newErrors.street = "Rua é obrigatória";
    if (!address.number.trim()) newErrors.number = "Número é obrigatório";
    if (!address.neighborhood.trim())
      newErrors.neighborhood = "Bairro é obrigatório";
    if (!address.city.trim()) newErrors.city = "Cidade é obrigatória";
    if (!address.state.trim()) newErrors.state = "Estado é obrigatório";
    if (!address.zipCode.trim()) newErrors.zipCode = "CEP é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (saveData) {
        try {
          localStorage.setItem("checkout:address", JSON.stringify(address));
        } catch {}
      }
      onSubmit(address);
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const states = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome Completo *
          </label>
          <input
            type="text"
            id="fullName"
            value={address.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Digite seu nome completo"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            E-mail *
          </label>
          <input
            type="email"
            id="email"
            value={address.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="nome@exemplo.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Telefone *
          </label>
          <input
            type="tel"
            id="phone"
            value={address.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="(11) 99999-9999"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="cpfCnpj"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CPF/CNPJ (para pagamento no cartão)
          </label>
          <input
            type="text"
            id="cpfCnpj"
            value={address.cpfCnpj}
            onChange={(e) => handleInputChange("cpfCnpj", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Somente números"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label
            htmlFor="street"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rua *
          </label>
          <input
            type="text"
            id="street"
            value={address.street}
            onChange={(e) => handleInputChange("street", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.street ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nome da rua"
          />
          {errors.street && (
            <p className="text-red-500 text-sm mt-1">{errors.street}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="number"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Número *
          </label>
          <input
            type="text"
            id="number"
            value={address.number}
            onChange={(e) => handleInputChange("number", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.number ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="123"
          />
          {errors.number && (
            <p className="text-red-500 text-sm mt-1">{errors.number}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="complement"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Complemento
        </label>
        <input
          type="text"
          id="complement"
          value={address.complement}
          onChange={(e) => handleInputChange("complement", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Apartamento, bloco, etc."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="neighborhood"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bairro *
          </label>
          <input
            type="text"
            id="neighborhood"
            value={address.neighborhood}
            onChange={(e) => handleInputChange("neighborhood", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.neighborhood ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nome do bairro"
          />
          {errors.neighborhood && (
            <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cidade *
          </label>
          <input
            type="text"
            id="city"
            value={address.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nome da cidade"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Estado *
          </label>
          <select
            id="state"
            value={address.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.state ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Selecione o estado</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="zipCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CEP *
          </label>
          <input
            type="text"
            id="zipCode"
            value={address.zipCode}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.zipCode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="00000-000"
          />
          {errors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="saveData"
          type="checkbox"
          checked={saveData}
          onChange={(e) => setSaveData(e.target.checked)}
        />
        <label htmlFor="saveData" className="text-sm text-gray-700">
          Salvar endereço e dados fiscais neste dispositivo
        </label>
      </div>

      <Button type="submit" disabled={loading} className="w-full py-3 text-lg">
        {loading ? "Processando..." : "Continuar para Pagamento"}
      </Button>
    </form>
  );
}
