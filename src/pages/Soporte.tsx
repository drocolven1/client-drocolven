// SupportForm.tsx
import ClientLayout from "@/layouts/Client";
import React, { useState } from "react";

export const SupportForm: React.FC = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Soporte enviado:", form);
        alert("Tu solicitud ha sido enviada. Te responderemos pronto.");
        setForm({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <ClientLayout>

            <main className="h-screen w-full flex items-center justify-center p-6 overflow-auto">
                <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6">
                        Soporte Técnico
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Nombre completo
                            </label>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Correo electrónico
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="juan@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Asunto
                            </label>
                            <input
                                name="subject"
                                type="text"
                                value={form.subject}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="Problema con mi cuenta"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Descripción
                            </label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-vertical focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="Cuéntanos qué está pasando..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                        >
                            Enviar Solicitud
                        </button>
                    </form>
                </div>
            </main>
        </ClientLayout>
    );
};
