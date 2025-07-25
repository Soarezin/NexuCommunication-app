// src/pages/login/Login.tsx
import { useState, useEffect } from "react"; // Importar useEffect
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assumindo que você tem um componente Input
import { Label } from "@/components/ui/label"; // Assumindo que você tem um componente Label
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth"; // Importe o hook useAuth
import type { RegisterData } from "../../types/auth"; // Importe a interface RegisterData

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading, error } = useAuth(); // Acesse as funções e estados do contexto

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Para alternar entre login e registro

  // Estados para o formulário de registro
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tenantName, setTenantName] = useState("");


  // Efeito para redirecionar se já estiver autenticado ou após login/registro bem-sucedido
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard"); // Redireciona para o dashboard se estiver logado
    }
  }, [isAuthenticated, loading, navigate]); // Dependências do useEffect

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário de recarregar a página
    if (!email || !password) {
      // Basic client-side validation
      return;
    }
    const success = await login(email, password);
    // O redirecionamento é feito pelo useEffect se 'isAuthenticated' mudar para true
    if (!success) {
        // O erro já será setado no contexto e exibido abaixo
        console.error("Falha no login. Verifique as credenciais ou o erro exibido.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !tenantName) {
      // Basic client-side validation for register
      return;
    }

    const registerData: RegisterData = { email, password, firstName, lastName, tenantName };
    const success = await register(registerData);
    // O redirecionamento é feito pelo useEffect se 'isAuthenticated' mudar para true
    if (!success) {
        // O erro já será setado no contexto e exibido abaixo
        console.error("Falha no registro. Verifique os dados ou o erro exibido.");
    }
  };

  // Se estiver carregando, mostra uma mensagem
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se já estiver autenticado, não renderiza o formulário de login (o useEffect cuida do redirecionamento)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">
            {isRegistering ? "Registrar" : "Login"}
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {isRegistering ? (
          // Formulário de Registro
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <Label htmlFor="regEmail">Email</Label>
              <Input
                id="regEmail"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="regPassword">Senha</Label>
              <Input
                id="regPassword"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Seu Nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Seu Sobrenome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="tenantName">Nome do Escritório</Label>
              <Input
                id="tenantName"
                type="text"
                placeholder="Nome do seu escritório/tenant"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Registrar</Button>
            <Button variant="link" onClick={() => setIsRegistering(false)} className="w-full">
              Já tenho conta
            </Button>
          </form>
        ) : (
          // Formulário de Login
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
            <Button variant="link" onClick={() => setIsRegistering(true)} className="w-full">
              Não tenho conta? Registrar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}