import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const TurbomachineCalculator = () => {
  const [inputs, setInputs] = useState({
    // Flight parameters
    M0: '',
    h: '',
    T0: '',
    P0: '',
    
    // Pressure ratios
    πdmax: '',
    πb: '',
    πn: '',
    πc: '',
    
    // Efficiencies
    ec: '',
    et: '',
    ef: '',
    
    // Temperatures
    Tt4: '',
    Tt7: '',
  });

  const [results, setResults] = useState(null);

  // Calculate pressure ratios and temperatures
  const calculateResults = () => {
    const M0 = parseFloat(inputs.M0);
    const h = parseFloat(inputs.h);
    const T0 = parseFloat(inputs.T0);
    const P0 = parseFloat(inputs.P0);

    // Atmospheric calculations
    const theta = T0 / 288.15;
    const delta = P0 / 101325;

    // Total conditions
    const Tt0 = T0 * (1 + 0.2 * M0 * M0);
    const Pt0 = P0 * Math.pow((1 + 0.2 * M0 * M0), 3.5);

    // Component calculations
    const πc = parseFloat(inputs.πc);
    const Tt3 = Tt0 * Math.pow(πc, 0.286);
    const Tt4 = parseFloat(inputs.Tt4);
    
    // Power calculations
    const Cp = 1005; // J/kg-K
    const τλ = Tt4 / Tt0;
    const τc = Tt3 / Tt0;
    
    setResults({
      Tt0,
      Pt0,
      Tt3,
      τλ,
      τc,
      specificThrust: calculateSpecificThrust(M0, Tt4, Tt0, πc),
      thermalEfficiency: calculateThermalEfficiency(Tt4, Tt3, Tt0),
      propulsiveEfficiency: calculatePropulsiveEfficiency(M0),
    });
  };

  const calculateSpecificThrust = (M0, Tt4, Tt0, πc) => {
    const Cp = 1005;
    const γ = 1.4;
    return Cp * (Tt4 - Tt0) / (γ * 287 * Tt0 * M0);
  };

  const calculateThermalEfficiency = (Tt4, Tt3, Tt0) => {
    return (Tt4 - Tt3) / (Tt4 - Tt0);
  };

  const calculatePropulsiveEfficiency = (M0) => {
    return 2 / (1 + M0);
  };

  const performanceData = results ? [
    {
      name: 'Design Point',
      specificThrust: results.specificThrust,
      efficiency: results.thermalEfficiency * 100
    },
    // Additional operating points could be added here
  ] : [];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Turbomachine Design Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inputs">
          <TabsList>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="inputs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Flight Parameters</h3>
                <div className="space-y-2">
                  <Input 
                    placeholder="Mach Number"
                    value={inputs.M0}
                    onChange={(e) => setInputs({...inputs, M0: e.target.value})}
                  />
                  <Input 
                    placeholder="Altitude (m)"
                    value={inputs.h}
                    onChange={(e) => setInputs({...inputs, h: e.target.value})}
                  />
                  <Input 
                    placeholder="Temperature (K)"
                    value={inputs.T0}
                    onChange={(e) => setInputs({...inputs, T0: e.target.value})}
                  />
                  <Input 
                    placeholder="Pressure (Pa)"
                    value={inputs.P0}
                    onChange={(e) => setInputs({...inputs, P0: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Component Parameters</h3>
                <div className="space-y-2">
                  <Input 
                    placeholder="Compressor Pressure Ratio"
                    value={inputs.πc}
                    onChange={(e) => setInputs({...inputs, πc: e.target.value})}
                  />
                  <Input 
                    placeholder="Turbine Entry Temperature (K)"
                    value={inputs.Tt4}
                    onChange={(e) => setInputs({...inputs, Tt4: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <Button 
              className="mt-4"
              onClick={calculateResults}
            >
              Calculate
            </Button>
          </TabsContent>

          <TabsContent value="results">
            {results && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Performance Results</h3>
                  <div className="space-y-2">
                    <p>Specific Thrust: {results.specificThrust.toFixed(2)} N/(kg/s)</p>
                    <p>Thermal Efficiency: {(results.thermalEfficiency * 100).toFixed(2)}%</p>
                    <p>Propulsive Efficiency: {(results.propulsiveEfficiency * 100).toFixed(2)}%</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Station Parameters</h3>
                  <div className="space-y-2">
                    <p>T0: {results.Tt0.toFixed(2)} K</p>
                    <p>P0: {results.Pt0.toFixed(2)} Pa</p>
                    <p>T3: {results.Tt3.toFixed(2)} K</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance">
            {results && (
              <div>
                <h3 className="text-lg font-medium mb-4">Performance Chart</h3>
                <LineChart width={600} height={300} data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="specificThrust" stroke="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#82ca9d" />
                </LineChart>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TurbomachineCalculator;