import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stage, Layer, Line, Text, Image as KonvaImage, Group } from "react-konva";
import useImage from "use-image";

export default function ChaineCotesApp() {
  const [cotes, setCotes] = useState([
    { id: "L1", valeur: 120.2, tolMin: -0.1, tolMax: 0.1 },
    { id: "L2", valeur: 40.0, tolMin: -0.2, tolMax: 0.3 },
  ]);
  const [imageSrc, setImageSrc] = useState(null);
  const [image] = useImage(imageSrc);
  const fileInputRef = useRef(null);
  const [jeu, setJeu] = useState({ min: 0, max: 0 });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [positions, setPositions] = useState([
    { x: 50, y: 100 },
    { x: 200, y: 100 },
  ]);

  useEffect(() => {
    const totalValeur = cotes.reduce((acc, c) => acc + c.valeur, 0);
    const totalTolMin = cotes.reduce((acc, c) => acc + c.tolMin, 0);
    const totalTolMax = cotes.reduce((acc, c) => acc + c.tolMax, 0);
    setJeu({ min: totalValeur + totalTolMin, max: totalValeur + totalTolMax });
  }, [cotes]);

  const addCote = () => {
    setCotes([
      ...cotes,
      {
        id: `L${cotes.length + 1}`,
        valeur: 0,
        tolMin: 0,
        tolMax: 0,
      },
    ]);
    setPositions([...positions, { x: 50 + 150 * cotes.length, y: 100 }]);
  };

  const deleteCote = (index) => {
    const updatedCotes = cotes.filter((_, i) => i !== index);
    const updatedPositions = positions.filter((_, i) => i !== index);
    setCotes(updatedCotes);
    setPositions(updatedPositions);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const data = {
      cotes,
      imageSrc,
      positions,
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chaine_cotes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        setCotes(data.cotes || []);
        setImageSrc(data.imageSrc || null);
        setPositions(data.positions || []);
      };
      reader.readAsText(file);
    }
  };

  const totalValeur = cotes.reduce((acc, c) => acc + c.valeur, 0);
  const totalTolMin = cotes.reduce((acc, c) => acc + c.tolMin, 0);
  const totalTolMax = cotes.reduce((acc, c) => acc + c.tolMax, 0);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {/* Zone graphique vectorielle */}
      <Card className="col-span-2 h-[500px] p-4">
        <CardContent className="h-full border bg-white relative">
          <div className="absolute top-2 right-2 flex space-x-2">
            <Label className="text-sm font-medium">Importer une image :</Label>
            <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="text-sm" />
            <Label className="text-sm font-medium">Charger un projet :</Label>
            <input type="file" accept=".json" onChange={handleImport} className="text-sm" />
            <Button onClick={handleExport}>Sauvegarder</Button>
          </div>
          <Stage width={800} height={460} className="border">
            <Layer>
              {image && <KonvaImage image={image} width={800} height={460} />}
              {cotes.map((cote, index) => (
                <Group
                  key={index}
                  draggable
                  x={positions[index].x}
                  y={positions[index].y}
                  onDragEnd={(e) => {
                    const newPositions = [...positions];
                    newPositions[index] = { x: e.target.x(), y: e.target.y() };
                    setPositions(newPositions);
                  }}
                >
                  <Line points={[0, 0, 100, 0]} stroke="red" strokeWidth={2} />
                  <Text x={10} y={-20} text={`${cote.id}: ${cote.valeur} mm`} fontSize={14} fill="blue" />
                </Group>
              ))}
            </Layer>
          </Stage>
        </CardContent>
      </Card>

      {/* Tableau des cotes */}
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Tableau des cotes</h2>
            <Button onClick={addCote}>Ajouter</Button>
          </div>

          <div className="grid grid-cols-5 gap-2 font-semibold text-sm">
            <div>Nom</div>
            <div>Valeur (mm)</div>
            <div>Tol. Min (mm)</div>
            <div>Tol. Max (mm)</div>
            <div>Actions</div>
          </div>

          {cotes.map((cote, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 items-center">
              <Input
                value={cote.id}
                onChange={(e) => {
                  const updated = [...cotes];
                  updated[index].id = e.target.value;
                  setCotes(updated);
                }}
              />
              <Input
                type="number"
                value={cote.valeur}
                onChange={(e) => {
                  const updated = [...cotes];
                  updated[index].valeur = parseFloat(e.target.value);
                  setCotes(updated);
                }}
              />
              <Input
                type="number"
                value={cote.tolMin}
                onChange={(e) => {
                  const updated = [...cotes];
                  updated[index].tolMin = parseFloat(e.target.value);
                  setCotes(updated);
                }}
              />
              <Input
                type="number"
                value={cote.tolMax}
                onChange={(e) => {
                  const updated = [...cotes];
                  updated[index].tolMax = parseFloat(e.target.value);
                  setCotes(updated);
                }}
              />
              <Button variant="destructive" onClick={() => deleteCote(index)}>Supprimer</Button>
            </div>
          ))}

          <div className="grid grid-cols-5 gap-2 font-semibold border-t pt-2">
            <div>Total</div>
            <div>{totalValeur.toFixed(2)}</div>
            <div>{totalTolMin.toFixed(2)}</div>
            <div>{totalTolMax.toFixed(2)}</div>
            <div></div>
          </div>

          <div className="text-sm text-gray-700">
            Jeu fonctionnel : <strong>{jeu.min.toFixed(2)} mm</strong> à <strong>{jeu.max.toFixed(2)} mm</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
