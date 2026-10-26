// Recorded demonstration artifacts; this file never starts inference.
window.SCHGEN_SHOWCASE = {
  "model": "MiniCPM5-2B · 第三轮 LoRA（合并版）",
  "mode": "static_showcase",
  "examples": [
    {
      "id": "basic-ldo",
      "title": "基础 3.3V 稳压",
      "prompt": "I’d like a simple **3.3 V power-regulation block** for my PCB, taking a raw **VIN** input and generating a regulated **+3V3** output, with proper input/output decoupling.\n\n### Main function\n- The circuit should accept **VIN** (my main supply input), feed it into an LDO regulator, and output a clean **+3V3** rail.\n- **EN** (enable) should be tied to **VIN** so the regulator automatically turns on whenever VIN is present.\n- Include **two 1 µF capacitors**: one on VIN for input bypassing and one on +3V3 for output stability.\n\n### Parts / symbols I want\n1. **U1 = AP2112K-3.3** (SOT-23-5 LDO regulator)\n   - Pins as in the symbol:\n     - Pin 1 = **VIN**\n     - Pin 2 = **GND**\n     - Pin 3 = **EN**\n     - Pin 4 = **NC**\n     - Pin 5 = **VOUT** (this is the +3V3 rail)\n\n2. **C1 = 1 µF** (input capacitor, 0201)\n3. **C2 = 1 µF** (output capacitor, 0201)\n\n### Nets / labels I need\n- **VIN** net (input supply)\n- **+3V3** net (regulated output)\n- **GND** net\n- One explicit **NC/unconnected** net for U1 pin 4 (as “unconnected-(U1-NC-Pad4)”)\n\n### Exact connectivity (pin-by-pin)\n- **Net VIN**\n  - Connect **U1 pin 1 (VIN)** to **VIN**\n  - Connect **U1 pin 3 (EN)** to **VIN** (so EN is hard-tied high when VIN is present)\n  - Connect **C1 pin 1** to **VIN**\n\n- **Net +3V3**\n  - Connect **U1 pin 5 (VOUT)** to **+3V3**\n  - Connect **C2 pin 1** to **+3V3**\n\n- **Net GND**\n  - Connect **U1 pin 2 (GND)** to **GND**\n  - Connect **C1 pin 2** to **GND**\n  - Connect **C2 pin 2** to **GND**\n\n- **Unconnected**\n  - Leave **U1 pin 4 (NC)** not connected (keep it as an explicit no-connect)\n\nThis is basically a compact VIN-to-3.3V LDO stage with the enable tied to VIN and 1 µF caps on both input and output.\nYou may need the following symbol information from KiCad library: .",
      "source": {
        "dataset": "SchGen_dataset.jsonl",
        "line": 1286
      },
      "available": true,
      "pcb": "assets/basic-ldo/pcb.svg",
      "schematic": "assets/basic-ldo/schematic.svg",
      "metrics": {
        "components": 3,
        "nets": 4,
        "routedNets": 3,
        "tracks": 14,
        "vias": 0,
        "drcErrors": 0,
        "drcWarnings": 0,
        "unconnected": 0,
        "ercErrors": 2,
        "ercWarnings": 0,
        "ignoredRules": [
          {
            "key": "missing_courtyard",
            "description": "Footprint has no courtyard defined"
          },
          {
            "key": "track_not_centered_on_via",
            "description": "Track endpoint not centered on via"
          },
          {
            "key": "tuning_profile_track_geometries",
            "description": "Tuning profile track geometries"
          },
          {
            "key": "footprint_filters_mismatch",
            "description": "Footprint doesn't match symbol's footprint filters"
          },
          {
            "key": "footprint_type_mismatch",
            "description": "Footprint component type doesn't match footprint pads"
          }
        ],
        "boardWidthMm": 11.3,
        "boardHeightMm": 13.9
      },
      "note": "已保存的模型输出与自动布局布线结果。保留原有 ERC 提示；尚未验证实际电路功能。",
      "checks": {
        "erc": {
          "kind": "erc",
          "available": true,
          "date": "2026-10-21T16:30:52",
          "units": "mm",
          "ignored": [
            {
              "key": "single_global_label",
              "description": "Global label only appears once in the schematic"
            },
            {
              "key": "four_way_junction",
              "description": "Four connection points are joined together"
            },
            {
              "key": "simulation_model_issue",
              "description": "SPICE model issue"
            },
            {
              "key": "footprint_filter",
              "description": "Assigned footprint doesn't match footprint filters"
            }
          ],
          "counts": {
            "errors": 2,
            "warnings": 0,
            "exclusions": 0,
            "others": 0,
            "violations": 2
          },
          "groups": [
            {
              "key": "violations",
              "label": "电气规则问题",
              "issues": [
                {
                  "severity": "error",
                  "type": "power_pin_not_driven",
                  "description": "Input Power pin not driven by any Output Power pins",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol #PWR1 Pin 1 [Power input, Line]",
                      "uuid": "1094c936-fbab-4417-97b0-eb6e5bc1951c",
                      "pos": {
                        "x": 129.54,
                        "y": 111.76
                      }
                    }
                  ]
                },
                {
                  "severity": "error",
                  "type": "power_pin_not_driven",
                  "description": "Input Power pin not driven by any Output Power pins",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol #PWR2 Pin 1 [Power input, Line]",
                      "uuid": "526f700e-1e68-47d4-9afb-d65d4a48c412",
                      "pos": {
                        "x": 149.86,
                        "y": 87.63
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "drc": {
          "kind": "drc",
          "available": true,
          "date": "2026-10-21T16:30:57",
          "units": "mm",
          "ignored": [
            {
              "key": "missing_courtyard",
              "description": "Footprint has no courtyard defined"
            },
            {
              "key": "track_not_centered_on_via",
              "description": "Track endpoint not centered on via"
            },
            {
              "key": "tuning_profile_track_geometries",
              "description": "Tuning profile track geometries"
            },
            {
              "key": "footprint_filters_mismatch",
              "description": "Footprint doesn't match symbol's footprint filters"
            },
            {
              "key": "footprint_type_mismatch",
              "description": "Footprint component type doesn't match footprint pads"
            }
          ],
          "counts": {
            "errors": 0,
            "warnings": 0,
            "exclusions": 0,
            "others": 0,
            "violations": 0,
            "unconnected_items": 0,
            "schematic_parity": 0
          },
          "groups": [
            {
              "key": "violations",
              "label": "PCB 规则问题",
              "issues": []
            },
            {
              "key": "unconnected_items",
              "label": "未连接项目",
              "issues": []
            },
            {
              "key": "schematic_parity",
              "label": "原理图一致性问题",
              "issues": []
            }
          ]
        },
        "source": "已保存结果"
      }
    },
    {
      "id": "ldo-enable",
      "title": "3.3V LDO 稳压",
      "prompt": "I need a small power-conditioning block in my PCB schematic that takes an input supply **VCC** and generates a regulated **+3V3** rail, using an **AP2112K-3.3 LDO**.\n\n### Symbols / parts I want\n- **U1:** AP2112K-3.3 (SOT-23-5) linear regulator  \n  Pins: 1=VIN, 2=GND, 3=EN, 4=NC, 5=VOUT\n- **C1:** 1.0uF capacitor (0201) for input decoupling\n- **C2:** 1.0uF capacitor (0201) for output decoupling\n- **R1:** 100k resistor (0201) used to pull the enable pin up to VCC\n- Net labels/rails: **VCC**, **+3V3**, **GND**, **EN** (and keep **U1 pin 4** explicitly no-connect)\n\n### Connectivity requirements (netlist-accurate)\n**VCC net**\n- **U1 pin 1 (VIN)** → **VCC**\n- **C1 pin 1** → **VCC**\n- **R1 pin 2** → **VCC**\n\n**+3V3 net**\n- **U1 pin 5 (VOUT)** → **+3V3**\n- **C2 pin 1** → **+3V3**\n\n**GND net**\n- **U1 pin 2 (GND)** → **GND**\n- **C1 pin 2** → **GND**\n- **C2 pin 2** → **GND**\n\n**EN net**\n- **U1 pin 3 (EN)** → net label **EN**\n- **R1 pin 1** → **EN** (so R1 is a pull-up from VCC to EN)\n\n**No-connect**\n- **U1 pin 4 (NC)** should be left unconnected (explicit NC marker / “unconnected-(U1-NC-Pad4)”).\n\n### Functional intent\nWhen **VCC** is present and the **EN** net is asserted (it will default high via **R1 = 100k** pull-up to VCC unless driven otherwise), **U1** regulates **VCC** down to **+3V3**. **C1** stabilizes the input, and **C2** stabilizes the regulator output.\nYou may need the following symbol information from KiCad library: .",
      "source": {
        "dataset": "SchGen_dataset.jsonl",
        "line": 584
      },
      "available": true,
      "pcb": "assets/ldo-enable/pcb.svg",
      "schematic": "assets/ldo-enable/schematic.svg",
      "metrics": {
        "components": 4,
        "nets": 6,
        "routedNets": 4,
        "tracks": 19,
        "vias": 0,
        "drcErrors": 0,
        "drcWarnings": 0,
        "unconnected": 0,
        "ercErrors": 5,
        "ercWarnings": 1,
        "ignoredRules": [
          {
            "key": "missing_courtyard",
            "description": "Footprint has no courtyard defined"
          },
          {
            "key": "track_not_centered_on_via",
            "description": "Track endpoint not centered on via"
          },
          {
            "key": "tuning_profile_track_geometries",
            "description": "Tuning profile track geometries"
          },
          {
            "key": "footprint_filters_mismatch",
            "description": "Footprint doesn't match symbol's footprint filters"
          },
          {
            "key": "footprint_type_mismatch",
            "description": "Footprint component type doesn't match footprint pads"
          }
        ],
        "boardWidthMm": 21.5,
        "boardHeightMm": 15.3
      },
      "note": "已保存的模型输出与自动布局布线结果。保留原有 ERC 提示；尚未验证实际电路功能。",
      "checks": {
        "erc": {
          "kind": "erc",
          "available": true,
          "date": "2026-10-20T13:24:25",
          "units": "mm",
          "ignored": [
            {
              "key": "single_global_label",
              "description": "Global label only appears once in the schematic"
            },
            {
              "key": "four_way_junction",
              "description": "Four connection points are joined together"
            },
            {
              "key": "simulation_model_issue",
              "description": "SPICE model issue"
            },
            {
              "key": "footprint_filter",
              "description": "Assigned footprint doesn't match footprint filters"
            }
          ],
          "counts": {
            "errors": 5,
            "warnings": 1,
            "exclusions": 0,
            "others": 0,
            "violations": 6
          },
          "groups": [
            {
              "key": "violations",
              "label": "电气规则问题",
              "issues": [
                {
                  "severity": "error",
                  "type": "power_pin_not_driven",
                  "description": "Input Power pin not driven by any Output Power pins",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol #PWR1 Pin 1 [Power input, Line]",
                      "uuid": "6a5c7ea1-2306-4d21-a315-ab83f11e1705",
                      "pos": {
                        "x": 105.41,
                        "y": 93.98
                      }
                    }
                  ]
                },
                {
                  "severity": "error",
                  "type": "power_pin_not_driven",
                  "description": "Input Power pin not driven by any Output Power pins",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol #PWR2 Pin 1 [Power input, Line]",
                      "uuid": "c7f4212c-5c48-4f4c-a47c-0c8801beeb8f",
                      "pos": {
                        "x": 105.41,
                        "y": 107.95
                      }
                    }
                  ]
                },
                {
                  "severity": "error",
                  "type": "power_pin_not_driven",
                  "description": "Input Power pin not driven by any Output Power pins",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol U1 Pin 1 [VIN, Power input, Line]",
                      "uuid": "43f458b7-dafb-4446-ac52-7bd930961a79",
                      "pos": {
                        "x": 142.24,
                        "y": 97.79
                      }
                    }
                  ]
                },
                {
                  "severity": "error",
                  "type": "pin_not_connected",
                  "description": "Pin not connected",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol U1 Pin 3 [EN, Input, Line]",
                      "uuid": "2499436e-92db-4224-9fa8-f32a28992f3a",
                      "pos": {
                        "x": 142.24,
                        "y": 100.33
                      }
                    }
                  ]
                },
                {
                  "severity": "error",
                  "type": "pin_not_driven",
                  "description": "Input pin not driven by any Output pins",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol U1 Pin 3 [EN, Input, Line]",
                      "uuid": "2499436e-92db-4224-9fa8-f32a28992f3a",
                      "pos": {
                        "x": 142.24,
                        "y": 100.33
                      }
                    }
                  ]
                },
                {
                  "severity": "warning",
                  "type": "multiple_net_names",
                  "description": "Both EN and VCC are attached to the same items; EN will be used in the netlist",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Global Label 'EN'",
                      "uuid": "ddcc7be7-eca5-4ed2-8661-1c5413be5570",
                      "pos": {
                        "x": 115.57,
                        "y": 99.06
                      }
                    },
                    {
                      "description": "Symbol #PWR1 Pin 1 [Power input, Line]",
                      "uuid": "6a5c7ea1-2306-4d21-a315-ab83f11e1705",
                      "pos": {
                        "x": 105.41,
                        "y": 93.98
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "drc": {
          "kind": "drc",
          "available": true,
          "date": "2026-10-20T13:24:31",
          "units": "mm",
          "ignored": [
            {
              "key": "missing_courtyard",
              "description": "Footprint has no courtyard defined"
            },
            {
              "key": "track_not_centered_on_via",
              "description": "Track endpoint not centered on via"
            },
            {
              "key": "tuning_profile_track_geometries",
              "description": "Tuning profile track geometries"
            },
            {
              "key": "footprint_filters_mismatch",
              "description": "Footprint doesn't match symbol's footprint filters"
            },
            {
              "key": "footprint_type_mismatch",
              "description": "Footprint component type doesn't match footprint pads"
            }
          ],
          "counts": {
            "errors": 0,
            "warnings": 0,
            "exclusions": 0,
            "others": 0,
            "violations": 0,
            "unconnected_items": 0,
            "schematic_parity": 0
          },
          "groups": [
            {
              "key": "violations",
              "label": "PCB 规则问题",
              "issues": []
            },
            {
              "key": "unconnected_items",
              "label": "未连接项目",
              "issues": []
            },
            {
              "key": "schematic_parity",
              "label": "原理图一致性问题",
              "issues": []
            }
          ]
        },
        "source": "已保存结果"
      }
    },
    {
      "id": "led-jumper",
      "title": "LED 与焊桥",
      "prompt": "I’d like a very simple **3.3V power indicator LED subcircuit** on my PCB schematic, using the exact symbols/refs and connections below. The idea is: when **PWR1** is closed (solder-bridged), the board’s **+3V3** rail feeds a **1k** series resistor and an LED to **GND**, so the LED turns on to indicate power. If the jumper is left open, the LED stays off and doesn’t draw current.\n\n### Components / symbols I need\n- **PWR1**: `SolderJumper_2_Open` (2-pin solder jumper, default open)\n- **R1**: resistor, **1k**\n- **D1**: **LED**\n- Power symbols / net labels:\n  - **+3V3**\n  - **GND**\n\n### Net-by-net connectivity requirements (must match)\n- **Net +3V3**\n  - Connect **PWR1 pin 2 (B)** to **+3V3**.\n\n- **Net “Net-(PWR1-A)”** (this is the switched LED supply after the jumper)\n  - Connect **PWR1 pin 1 (A)** to **R1 pin 1**.\n\n- **Net “Net-(D1-A)”** (LED anode node between resistor and LED)\n  - Connect **R1 pin 2** to **D1 pin 2 (A)**.\n\n- **Net GND**\n  - Connect **D1 pin 1 (K)** to **GND**.\n\n### Functional behavior I’m expecting\n- With **PWR1 open**: +3V3 is not connected to the LED path → **LED off**.\n- With **PWR1 solder-bridged/closed**: current flows **+3V3 → PWR1 → R1 (1k) → D1 (A to K) → GND** → **LED on** as a power indicator.\nYou may need the following symbol information from KiCad library: .",
      "source": {
        "dataset": "SchGen_dataset.jsonl",
        "line": 5268
      },
      "available": true,
      "pcb": "assets/led-jumper/pcb.svg",
      "schematic": "assets/led-jumper/schematic.svg",
      "metrics": {
        "components": 3,
        "nets": 4,
        "routedNets": 2,
        "tracks": 4,
        "vias": 0,
        "drcErrors": 0,
        "drcWarnings": 0,
        "unconnected": 0,
        "ercErrors": 2,
        "ercWarnings": 0,
        "ignoredRules": [
          {
            "key": "missing_courtyard",
            "description": "Footprint has no courtyard defined"
          },
          {
            "key": "track_not_centered_on_via",
            "description": "Track endpoint not centered on via"
          },
          {
            "key": "tuning_profile_track_geometries",
            "description": "Tuning profile track geometries"
          },
          {
            "key": "footprint_filters_mismatch",
            "description": "Footprint doesn't match symbol's footprint filters"
          },
          {
            "key": "footprint_type_mismatch",
            "description": "Footprint component type doesn't match footprint pads"
          }
        ],
        "boardWidthMm": 14.7,
        "boardHeightMm": 13.4
      },
      "note": "已保存的模型输出与自动布局布线结果。保留原有 ERC 提示；尚未验证实际电路功能。",
      "checks": {
        "erc": {
          "kind": "erc",
          "available": true,
          "date": "2026-10-19T15:52:58",
          "units": "mm",
          "ignored": [
            {
              "key": "single_global_label",
              "description": "Global label only appears once in the schematic"
            },
            {
              "key": "four_way_junction",
              "description": "Four connection points are joined together"
            },
            {
              "key": "simulation_model_issue",
              "description": "SPICE model issue"
            },
            {
              "key": "footprint_filter",
              "description": "Assigned footprint doesn't match footprint filters"
            }
          ],
          "counts": {
            "errors": 2,
            "warnings": 0,
            "exclusions": 0,
            "others": 0,
            "violations": 2
          },
          "groups": [
            {
              "key": "violations",
              "label": "电气规则问题",
              "issues": [
                {
                  "severity": "error",
                  "type": "power_pin_not_driven",
                  "description": "Input Power pin not driven by any Output Power pins",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol #PWR1 Pin 1 [Power input, Line]",
                      "uuid": "c9071525-8edf-4eb1-a611-23a6dce43bd6",
                      "pos": {
                        "x": 149.86,
                        "y": 69.85
                      }
                    }
                  ]
                },
                {
                  "severity": "error",
                  "type": "power_pin_not_driven",
                  "description": "Input Power pin not driven by any Output Power pins",
                  "sheet": "/",
                  "items": [
                    {
                      "description": "Symbol #PWR2 Pin 1 [Power input, Line]",
                      "uuid": "ff11b51a-892d-4b27-a399-adeec0497894",
                      "pos": {
                        "x": 149.86,
                        "y": 110.49
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        "drc": {
          "kind": "drc",
          "available": true,
          "date": "2026-10-19T15:53:02",
          "units": "mm",
          "ignored": [
            {
              "key": "missing_courtyard",
              "description": "Footprint has no courtyard defined"
            },
            {
              "key": "track_not_centered_on_via",
              "description": "Track endpoint not centered on via"
            },
            {
              "key": "tuning_profile_track_geometries",
              "description": "Tuning profile track geometries"
            },
            {
              "key": "footprint_filters_mismatch",
              "description": "Footprint doesn't match symbol's footprint filters"
            },
            {
              "key": "footprint_type_mismatch",
              "description": "Footprint component type doesn't match footprint pads"
            }
          ],
          "counts": {
            "errors": 0,
            "warnings": 0,
            "exclusions": 0,
            "others": 0,
            "violations": 0,
            "unconnected_items": 0,
            "schematic_parity": 0
          },
          "groups": [
            {
              "key": "violations",
              "label": "PCB 规则问题",
              "issues": []
            },
            {
              "key": "unconnected_items",
              "label": "未连接项目",
              "issues": []
            },
            {
              "key": "schematic_parity",
              "label": "原理图一致性问题",
              "issues": []
            }
          ]
        },
        "source": "已保存结果"
      }
    }
  ]
};
