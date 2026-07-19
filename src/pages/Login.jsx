import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Check, Mail, Lock, Shield, Headphones } from 'lucide-react'
import { signIn, signUp } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import SplashScreen from '../components/SplashScreen'

const LOGO = (
  <div className="text-center mb-6">
    <div className="inline-flex items-center justify-center bg-white rounded-2xl p-4 mb-3">
      <img src="/img/180x120px.png" alt="Parcelyx" style={{height: '80px', width: 'auto'}} />
    </div>
  </div>
)

export default function Login() {
  const [tela, setTela] = useState('login')
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [negocio, setNegocio] = useState('')
  const [tipoNegocio, setTipoNegocio] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [chavePix, setChavePix] = useState('')
  const [showModalPix, setShowModalPix] = useState(false)
  const [lembrar, setLembrar] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [splashName, setSplashName] = useState('')

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')

    // Se digitar "admin" no e-mail, redireciona para o painel admin
    if (loginEmail.trim().toLowerCase() === 'admin' || loginEmail.trim().toLowerCase() === 'admin@parcelyx.com') {
      window.location.href = '/admin.html'
      return
    }

    setLoading(true)
    const { data, error } = await signIn(loginEmail, loginSenha)
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    // Busca nome do usuário
    try {
      const { data: userData } = await supabase.from('users').select('nome, negocio').eq('email', loginEmail).single()
      setSplashName(userData?.nome || userData?.negocio || loginEmail.split('@')[0])
    } catch (e) {
      setSplashName(loginEmail.split('@')[0])
    }
    setLoading(false)
    setShowSplash(true)
  }

  // Verifica em tempo real se digitou "admin" no campo de email
  const handleEmailChange = (e) => {
    const val = e.target.value
    setLoginEmail(val)
    if (val.trim().toLowerCase() === 'admin') {
      window.location.href = '/admin.html'
    }
  }

  const handleStep1 = (e) => {
    e.preventDefault()
    setErro('')
    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    setStep(2)
  }

  const handleStep2 = async (e) => {
    e.preventDefault()
    setErro('')
    if (!negocio) {
      setErro('Informe o nome do negócio.')
      return
    }
    setLoading(true)
    const { data, error } = await signUp(email, senha, { nome, negocio, telefone })
    setLoading(false)
    if (error) {
      if (error.message?.includes('already registered')) {
        setErro('Este e-mail já está cadastrado.')
      } else {
        setErro('Erro ao criar conta: ' + error.message)
      }
      return
    }
    await signIn(email, senha)
    setStep(3)
  }

  const handleTeste = () => { navigate('/') }

  const handleAssinar = () => {
    window.open('https://wa.me/5516992383821?text=Olá!%20Quero%20assinar%20o%20plano%20completo%20do%20Parcelyx.', '_blank')
  }

  const StepsIndicator = ({ atual }) => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            s < atual ? 'bg-pix-500 text-white' :
            s === atual ? 'bg-primary-600 text-white' :
            'bg-dark-600 text-gray-500'
          }`}>
            {s < atual ? <Check className="w-4 h-4" /> : s}
          </div>
          {i < 2 && (
            <div className={`w-8 h-0.5 ${s < atual ? 'bg-pix-400' : 'bg-dark-600'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const inputClass = "w-full px-4 py-3 pl-11 rounded-xl bg-dark-700 border border-dark-500 focus:border-pix-500 focus:ring-2 focus:ring-pix-500/20 outline-none transition-all text-sm text-gray-200 placeholder-gray-500"
  const inputClassNoIcon = "w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-500 focus:border-pix-500 focus:ring-2 focus:ring-pix-500/20 outline-none transition-all text-sm text-gray-200 placeholder-gray-500"

  // ══════════════════════════════════════════════════════
  // SPLASH SCREEN APÓS LOGIN
  // ══════════════════════════════════════════════════════
  if (showSplash) return (
    <SplashScreen
      userName={splashName}
      onFinish={() => navigate('/')}
    />
  )

  // ══════════════════════════════════════════════════════
  // TELA DE LOGIN
  // ══════════════════════════════════════════════════════
  if (tela === 'login') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dark-900">
      {/* Badge acesso seguro */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 mb-6">
        <Shield className="w-4 h-4 text-primary-400" />
        <span className="text-xs font-medium text-primary-400">Acesso seguro</span>
      </div>

      {LOGO}
      <h1 className="text-2xl font-bold text-white mb-1">Entrar na sua conta</h1>
      <p className="text-sm text-gray-400 mb-8">Fluxo de caixa, contratos e clientes no mesmo painel.</p>

      <div className="w-full max-w-md bg-dark-800 rounded-2xl border border-dark-500/50 p-6 md:p-8">
        <h2 className="text-lg font-bold text-white mb-1">Bem-vindo de volta</h2>
        <p className="text-sm text-gray-400 mb-6">Use seu e-mail e senha para continuar.</p>

        {erro && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{erro}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={loginEmail} onChange={handleEmailChange}
                placeholder="Digite seu e-mail" required className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type={showPassword ? 'text' : 'password'} value={loginSenha}
                onChange={e => setLoginSenha(e.target.value)}
                placeholder="Digite sua senha" required className={inputClass + ' pr-12'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Lembrar dados + Esqueci senha */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)}
                className="w-4 h-4 rounded border-dark-500 bg-dark-700 text-pix-500 focus:ring-pix-500/20" />
              <span className="text-xs text-gray-400">Lembrar dados</span>
            </label>
            <button type="button" className="text-xs text-pix-400 hover:text-pix-300 font-medium">
              Esqueci minha senha
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow-blue">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar e continuar'}
          </button>
        </form>

        {/* Badges de segurança */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-700 border border-dark-500/50">
            <Shield className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs text-gray-400">Criptografado</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-700 border border-dark-500/50">
            <Headphones className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs text-gray-400">Suporte humano</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-6">
        Ainda não tem conta?{' '}
        <button onClick={() => { setTela('cadastro'); setStep(1); setErro('') }}
          className="text-primary-400 font-semibold hover:text-primary-300">Cadastre-se</button>
      </p>

      <a href="https://wa.me/5516992383821" target="_blank" rel="noreferrer"
        className="flex items-center gap-2 mt-4 text-xs text-gray-500 hover:text-gray-300">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Ajuda no WhatsApp
      </a>
    </div>
  )

  // ══════════════════════════════════════════════════════
  // TELA DE CADASTRO
  // ══════════════════════════════════════════════════════
  if (tela === 'cadastro') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dark-900">
      {LOGO}
      <p className="text-gray-400 text-sm mb-8">Crie sua conta e comece a gerenciar suas cobranças</p>

      <div className="w-full max-w-md bg-dark-800 rounded-2xl border border-dark-500/50 p-6 md:p-8">
        <StepsIndicator atual={step} />
        {erro && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{erro}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Seus dados</h2>
              <p className="text-sm text-gray-400 mb-4">Informações da sua conta</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome completo *</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Seu nome completo" required className={inputClassNoIcon} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required className={inputClassNoIcon} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Telefone / WhatsApp *</label>
              <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999" required className={inputClassNoIcon} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha *</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres" required className={inputClassNoIcon} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar senha *</label>
              <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha" required className={inputClassNoIcon} />
            </div>
            <button type="submit" className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all">
              Continuar →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Seu negócio</h2>
              <p className="text-sm text-gray-400 mb-4">Como se chama sua empresa?</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome do negócio *</label>
              <input type="text" value={negocio} onChange={e => setNegocio(e.target.value)}
                placeholder="Ex: João Empréstimos" required className={inputClassNoIcon} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Tipo de negócio</label>
              <select value={tipoNegocio} onChange={e => setTipoNegocio(e.target.value)} className={inputClassNoIcon}>
                <option value="">Selecione...</option>
                <option>Empréstimos pessoais</option>
                <option>Vendas parceladas</option>
                <option>Financiamento de produtos</option>
                <option>Crédito consignado</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">CPF / CNPJ</label>
              <input type="text" value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)}
                placeholder="000.000.000-00" className={inputClassNoIcon} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Chave PIX</label>
              <input type="text" value={chavePix} onChange={e => setChavePix(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória" className={inputClassNoIcon} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => { setStep(1); setErro('') }}
                className="w-full py-3 border border-dark-500 text-gray-300 font-semibold rounded-xl hover:bg-dark-700">
                ← Voltar
              </button>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Criando...' : 'Continuar →'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-pix-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-pix-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Conta criada!</h2>
            <p className="text-sm text-gray-400 mb-1">Bem-vindo ao <strong className="text-pix-400">Parcelyx</strong>!</p>
            <p className="text-sm text-gray-400 mb-6">Sua conta foi criada com sucesso.</p>

            <div className="bg-dark-700 rounded-2xl p-4 text-left mb-6 space-y-2 border border-dark-500/50">
              {[
                { label: 'Nome', value: nome },
                { label: 'E-mail', value: email },
                { label: 'Negócio', value: negocio },
                { label: 'Tipo', value: tipoNegocio || '—' },
                { label: 'Chave PIX', value: chavePix || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-200">{value}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setTela('plano')}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl">
              Escolher plano →
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-400 text-sm mt-6">
        Já tem conta?{' '}
        <button onClick={() => { setTela('login'); setErro('') }} className="text-primary-400 font-semibold">Entrar</button>
      </p>
    </div>
  )

  // ══════════════════════════════════════════════════════
  // TELA DE ESCOLHA DE PLANO
  // ══════════════════════════════════════════════════════
  if (tela === 'plano') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dark-900">
      {LOGO}
      <h2 className="text-2xl font-bold text-white mb-2">Escolha seu plano</h2>
      <p className="text-gray-400 text-sm mb-10">Comece com 7 dias grátis ou adquira já o plano completo</p>

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TESTE GRÁTIS */}
        <div className="bg-dark-800 rounded-2xl border border-dark-500/50 p-8 flex flex-col">
          <h3 className="text-xl font-bold text-white text-center mb-2">Teste Grátis</h3>
          <div className="text-5xl font-extrabold text-center text-white my-4">7 dias</div>
          <p className="text-gray-400 text-sm text-center mb-6">Teste todas as funcionalidades sem compromisso</p>
          <ul className="space-y-3 mb-8 flex-1">
            {['Clientes ilimitados', 'Parcelamentos ilimitados', 'Cobranças via WhatsApp', 'Geração de PIX', 'Relatórios completos'].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-gray-500">•</span> {item}
              </li>
            ))}
          </ul>
          <button onClick={handleTeste}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all">
            Começar teste grátis
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">Sem cartão de crédito</p>
        </div>

        {/* PLANO COMPLETO */}
        <div className="bg-dark-800 rounded-2xl border-2 border-primary-500 p-8 flex flex-col relative">
          <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">RECOMENDADO</div>
          <div className="w-14 h-14 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white text-center mb-2">Plano Completo</h3>
          <div className="text-center my-4">
            <span className="text-4xl font-extrabold text-primary-400">R$ 29,00</span>
            <span className="text-gray-500 text-sm"> /mês</span>
          </div>
          <p className="text-gray-400 text-sm text-center mb-6">Acesso vitalício com suporte prioritário</p>
          <ul className="space-y-3 mb-8 flex-1">
            {['Tudo do plano grátis', 'Sem limites de uso', 'Suporte prioritário', 'Atualizações gratuitas', 'Backup automático'].map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-primary-400 flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
          <button onClick={handleAssinar}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar com suporte
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mt-8">
        Dúvidas?{' '}
        <a href="https://wa.me/5516992383821?text=Olá!%20Tenho%20dúvidas%20sobre%20o%20Parcelyx" target="_blank" rel="noreferrer"
          className="text-primary-400 font-semibold underline">
          Fale conosco no WhatsApp
        </a>
      </p>

    </div>
  )
}
