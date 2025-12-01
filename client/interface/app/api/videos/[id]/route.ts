import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Token não fornecido" },
        { status: 401 }
      );
    }

    const response = await fetch(`http://localhost:3333/videos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Erro ao deletar vídeo no backend" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Vídeo deletado com sucesso" });
  } catch (error) {
    console.error("Erro no delete proxy:", error);
    return NextResponse.json(
      { message: "Erro interno ao processar exclusão" },
      { status: 500 }
    );
  }
}
