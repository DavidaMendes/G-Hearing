import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const response = await fetch("http://localhost:3333/users/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      return NextResponse.json(
        { message: "Credenciais inválidas ou erro no servidor" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no login API Route:", error);
    return NextResponse.json(
      { message: "Erro interno ao processar login" },
      { status: 500 }
    );
  }
}
