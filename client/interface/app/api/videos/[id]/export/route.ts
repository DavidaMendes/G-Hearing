import { NextResponse } from "next/server";
import fs from "fs";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const response = await fetch(`http://localhost:3333/videos/${id}/export`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Erro ao gerar EDL no backend" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.edlPath) {
      return NextResponse.json(
        { message: "Caminho do arquivo não retornado pelo backend" },
        { status: 500 }
      );
    }

    if (!fs.existsSync(data.edlPath)) {
      return NextResponse.json(
        { message: "Arquivo EDL não encontrado no disco" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(data.edlPath);

    const filename = data.edlPath.split(/[\\/]/).pop() || `video_${id}.edl`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro no proxy de exportação:", error);
    return NextResponse.json(
      { message: "Erro interno ao exportar" },
      { status: 500 }
    );
  }
}
