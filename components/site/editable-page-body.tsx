// Renderizador deliberadamente limitado: admite títulos "##" y párrafos,
// pero nunca interpreta HTML almacenado en la base de datos.
export function EditablePageBody({body}:{body:string}){
  const blocks=body.split(/\n{2,}/).map(block=>block.trim()).filter(Boolean);
  return <>{blocks.map((block,index)=>{
    if(block.startsWith("## "))return <h2 key={index}>{block.slice(3)}</h2>;
    return <p key={index}>{block}</p>;
  })}</>;
}
