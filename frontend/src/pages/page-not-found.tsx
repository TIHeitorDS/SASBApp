export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <h1 className="text-4xl font-bold text-black">404 - Página Não Encontrada</h1>
      <p className="mt-4 text-gray-700">
        A solicitação que você fez não pôde ser encontrada. Por favor, verifique
        o URL ou volte para a página inicial.
      </p>

      <a href="/" className="mt-6 text-pink font-medium hover:underline">
        Voltar para a página inicial
      </a>
    </div>
  );
}
