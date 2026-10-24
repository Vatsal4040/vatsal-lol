(() => {
  // src/profiles/perceptionProfiles.ts
  var PERCEPTION_PROFILES = [
    {
      id: "human",
      name: "Human Standard",
      latinName: "Homo sapiens",
      category: "human_deficiencies",
      icon: "\u{1F464}",
      confidence: "High",
      confidenceReason: "Extensively calibrated human trichromatic baseline S/M/L cone response curve.",
      visionType: "Trichromatic (Red / Green / Blue)",
      summary: "Standard human trichromatic vision with three cone types peak-sensitive to 420nm (S), 534nm (M), and 564nm (L).",
      evolutionaryContext: "Evolved in primates for detecting ripe fruits amidst dense green rainforest foliage and subtle facial cues.",
      acuity: "20/20",
      acuityMultiplier: 1,
      fovDegrees: 180,
      binocularFOV: 120,
      wavelengthRange: "380 - 700 nm",
      flickerFusionHz: 60,
      receptors: {
        rods: "120 million (periphery / night)",
        cones: "6 million (fovea / color)",
        specialized: "ipRGCs (circadian rhythm)"
      },
      brightness: 1,
      contrast: 1,
      saturation: 1,
      blur: 0,
      colorMatrix: [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ]
    },
    {
      id: "dog",
      name: "Dog / Canine",
      latinName: "Canis lupus familiaris",
      category: "mammals",
      icon: "\u{1F436}",
      confidence: "High",
      confidenceReason: "Proven via electroretinography (ERG) & behavioral discrimination experiments (Miller & Murphy).",
      visionType: "Dichromatic (Blue / Yellow)",
      summary: "Dogs miss red-sensitive L-cones. Reds, oranges, and greens collapse into shades of yellow, grey, and blue.",
      evolutionaryContext: "Crepuscular hunters prioritized motion detection and night sensitivity over high-resolution chromatic detail.",
      acuity: "20/75",
      acuityMultiplier: 0.35,
      fovDegrees: 240,
      binocularFOV: 60,
      wavelengthRange: "429 - 555 nm",
      flickerFusionHz: 80,
      receptors: {
        rods: "High density + Tapetum Lucidum",
        cones: "Dichromatic (S-cone 429nm, L-cone 555nm)"
      },
      brightness: 1.15,
      contrast: 0.9,
      saturation: 0.85,
      blur: 1.8,
      colorMatrix: [
        0.625,
        0.375,
        0,
        0.7,
        0.3,
        0,
        0,
        0.3,
        0.7
      ],
      vignette: 0.15
    },
    {
      id: "cat",
      name: "Cat / Feline",
      latinName: "Felis catus",
      category: "mammals",
      icon: "\u{1F431}",
      confidence: "High",
      confidenceReason: "Well-documented tapetum lucidum retroreflection and dichromatic rod-dominated retina.",
      visionType: "Dichromatic + Low-Light Amplifier",
      summary: "Cats see vivid blues and greenish-yellows while reds appear muted or grey. Tapetum lucidum boosts night vision 6x.",
      evolutionaryContext: "Nocturnal stalking of small rodents in dim conditions required max light capture over daytime color richness.",
      acuity: "20/100",
      acuityMultiplier: 0.25,
      fovDegrees: 200,
      binocularFOV: 140,
      wavelengthRange: "450 - 555 nm",
      flickerFusionHz: 70,
      receptors: {
        rods: "Extreme density (25:1 rod-to-cone ratio)",
        cones: "Dichromatic (S-cone & M/L-cone)",
        specialized: "Tapetum Lucidum mirror layer"
      },
      brightness: 1.3,
      contrast: 0.85,
      saturation: 0.7,
      blur: 2.2,
      colorMatrix: [
        0.55,
        0.45,
        0,
        0.25,
        0.65,
        0.1,
        0,
        0.35,
        0.65
      ],
      nightVisionBoost: 0.45,
      vignette: 0.2
    },
    {
      id: "eagle",
      name: "Eagle / Raptor",
      latinName: "Aquila chrysaetos",
      category: "birds",
      icon: "\u{1F985}",
      confidence: "High",
      confidenceReason: "Dual deep foveae with ~1 million photoreceptors per mm\xB2 verified via microspectrophotometry.",
      visionType: "Tetrachromatic + Deep Dual Fovea",
      summary: "Eagles possess 4x to 8x human visual sharpness with dual foveae and UV sensitivity for spotting prey miles away.",
      evolutionaryContext: "High-altitude aerial hunting required hyper-focused center vision and UV urine track detection.",
      acuity: "20/5 (4x Sharpness)",
      acuityMultiplier: 4,
      fovDegrees: 340,
      binocularFOV: 50,
      wavelengthRange: "370 - 700 nm (UV-A enabled)",
      flickerFusionHz: 140,
      receptors: {
        rods: "Low density (daytime hunter)",
        cones: "1,000,000 / mm\xB2 Tetrachromatic (UV, S, M, L)",
        specialized: "Pecten oculi & oil droplet filters"
      },
      brightness: 1.05,
      contrast: 1.35,
      saturation: 1.25,
      blur: 0,
      colorMatrix: [
        1.15,
        -0.05,
        -0.1,
        -0.05,
        1.2,
        -0.15,
        0.1,
        -0.05,
        1.1
      ],
      sharpen: true,
      uvBoost: true
    },
    {
      id: "bee",
      name: "Honeybee",
      latinName: "Apis mellifera",
      category: "insects_reptiles",
      icon: "\u{1F41D}",
      confidence: "High",
      confidenceReason: "Trichromatic UV-Blue-Green model established by Nobel laureate Karl von Frisch.",
      visionType: "Trichromatic UV / Blue / Green (ommatidia)",
      summary: "Bees are blind to red but see Ultraviolet light clearly. Flower petals reveal bullseye UV nectar guides.",
      evolutionaryContext: "Co-evolved with angiosperm flowering plants for ultra-fast navigation and floral nectar foraging.",
      acuity: "20/1200",
      acuityMultiplier: 0.05,
      fovDegrees: 300,
      binocularFOV: 40,
      wavelengthRange: "300 - 650 nm (UV shifted)",
      flickerFusionHz: 200,
      receptors: {
        rods: "None",
        cones: "UV cone (344nm), Blue (436nm), Green (544nm)",
        specialized: "~5,000 Ommatidia compound eye facets"
      },
      brightness: 1.1,
      contrast: 1.2,
      saturation: 1.3,
      blur: 0.5,
      colorMatrix: [
        0,
        0.2,
        0.8,
        0.1,
        0.9,
        0,
        0.9,
        0,
        0.1
      ],
      ommatidiaGrid: 8,
      uvBoost: true
    },
    {
      id: "pit_viper",
      name: "Pit Viper (Infrared-Inspired)",
      latinName: "Crotalinae",
      category: "insects_reptiles",
      icon: "\u{1F40D}",
      confidence: "Approximation",
      confidenceReason: "Scientific limits: Pit organs detect thermal IR via TRPA1 channels and fuse thermal imagery with visual cortex.",
      visionType: "Visual Spectrum + Thermal Pit Organ Fusion",
      summary: "Pit vipers superimpose thermal infrared radiation (750nm-12,000nm) directly onto their dichromatic visual field.",
      evolutionaryContext: "Enables strike precision against warm-blooded rodents in total darkness.",
      acuity: "20/200",
      acuityMultiplier: 0.1,
      fovDegrees: 220,
      binocularFOV: 40,
      wavelengthRange: "400 - 12,000 nm (Thermal IR)",
      flickerFusionHz: 45,
      receptors: {
        rods: "Night rod dominant",
        cones: "Dichromatic (blue/green)",
        specialized: "Trigeminal pit organ heat sensors"
      },
      brightness: 1.1,
      contrast: 1.3,
      saturation: 1.4,
      blur: 1.2,
      colorMatrix: [
        1.3,
        0,
        0,
        0.4,
        0.8,
        0,
        0,
        0.1,
        0.2
      ],
      thermalMode: true
    },
    {
      id: "mantis_shrimp",
      name: "Mantis Shrimp (Research-Based Approximation)",
      latinName: "Stomatopoda",
      category: "marine_exotic",
      icon: "\u{1F990}",
      confidence: "Approximation",
      confidenceReason: "Scientific limits: Possesses 12-16 photoreceptor types plus linear and circular polarization vision.",
      visionType: "Dodecachromatic (12-16 Channel) + Polarized Vision",
      summary: "Mantis shrimp scan 12 spectral channels from deep UV to far red along with circular polarized light reflection.",
      evolutionaryContext: "Used for intra-species signaling, prey identification in turbid coral reefs, and combat defense.",
      acuity: "20/400",
      acuityMultiplier: 0.15,
      fovDegrees: 360,
      binocularFOV: 80,
      wavelengthRange: "300 - 720 nm (12 Channels)",
      flickerFusionHz: 100,
      receptors: {
        rods: "N/A",
        cones: "12-16 Photoreceptor types",
        specialized: "Rhabdoms with quarter-wave retarders"
      },
      brightness: 1.2,
      contrast: 1.4,
      saturation: 1.6,
      blur: 0.8,
      colorMatrix: [
        1.2,
        0.2,
        0.4,
        0.3,
        1.3,
        0.1,
        0.1,
        0.4,
        1.4
      ],
      ommatidiaGrid: 6,
      uvBoost: true
    },
    {
      id: "deep_sea_shark",
      name: "Deep Sea Shark (Low-Light Contrast Vision)",
      latinName: "Selachimorpha",
      category: "marine_exotic",
      icon: "\u{1F988}",
      confidence: "Medium",
      confidenceReason: "Rod-monochromat/dichromat retina with specialized green-shifted rod opsins for ocean light depth.",
      visionType: "High-Contrast Monochromatic Low-Light Vision",
      summary: "Sharks in deep waters maximize luminance contrast to silhouette prey against dim downwelling sunlight.",
      evolutionaryContext: "Optimized for motion tracking and outline discrimination in shadowy ocean depths.",
      acuity: "20/80",
      acuityMultiplier: 0.25,
      fovDegrees: 340,
      binocularFOV: 30,
      wavelengthRange: "470 - 520 nm (Green-Cyan Peak)",
      flickerFusionHz: 50,
      receptors: {
        rods: "Extreme density, tuned to 480nm",
        cones: "Minimal / Monochromatic",
        specialized: "Tapetum Lucidum mirror backing"
      },
      brightness: 1.25,
      contrast: 1.5,
      saturation: 0.2,
      blur: 1,
      colorMatrix: [
        0.1,
        0.8,
        0.1,
        0.1,
        0.8,
        0.1,
        0.1,
        0.8,
        0.1
      ],
      nightVisionBoost: 0.35,
      vignette: 0.3
    },
    {
      id: "anglerfish",
      name: "Deep Sea Anglerfish (Deep-Ocean Adaptation)",
      latinName: "Lophiiformes",
      category: "marine_exotic",
      icon: "\u{1F41F}",
      confidence: "Approximation",
      confidenceReason: "Scientific limits: Adapted to near-total abyssal darkness (~1,000m depth) where bioluminescence is the only light.",
      visionType: "Abyssal Monochromatic Bioluminescence Tracker",
      summary: "Tuned specifically to sense faint blue-green bioluminescent flashes emitted by prey lures and mates in pitch black.",
      evolutionaryContext: "Extremely high rod sensitivity amplifies rare bioluminescent photons in the midnight zone.",
      acuity: "20/300",
      acuityMultiplier: 0.12,
      fovDegrees: 200,
      binocularFOV: 60,
      wavelengthRange: "460 - 490 nm (Bioluminescent Blue)",
      flickerFusionHz: 30,
      receptors: {
        rods: "Multi-layer rod stack opsins",
        cones: "Absent",
        specialized: "High quantum efficiency rod stacks"
      },
      brightness: 1.4,
      contrast: 1.8,
      saturation: 0.3,
      blur: 1.5,
      colorMatrix: [
        0,
        0.2,
        0.8,
        0,
        0.3,
        0.7,
        0,
        0.1,
        0.9
      ],
      bioluminescenceGain: true,
      nightVisionBoost: 0.6
    },
    {
      id: "owl",
      name: "Great Horned Owl",
      latinName: "Bubo virginianus",
      category: "birds",
      icon: "\u{1F989}",
      confidence: "High",
      confidenceReason: "Tubular eyes with high rod density and binocular depth perception proven in lab flights.",
      visionType: "Binocular Night Vision (Tubular Eyes)",
      summary: "Owl eyes are fixed tubular lenses providing 2.5x light gathering power for night hunting with 3D depth perception.",
      evolutionaryContext: "Nocturnal apex predator requiring stereoscopic distance judgment in minimal ambient starlight.",
      acuity: "20/40",
      acuityMultiplier: 0.5,
      fovDegrees: 110,
      binocularFOV: 70,
      wavelengthRange: "400 - 700 nm",
      flickerFusionHz: 75,
      receptors: {
        rods: "Massive density (~10,000 / mm\xB2)",
        cones: "Sparse dichromatic",
        specialized: "Tubular fixed eye structure"
      },
      brightness: 1.35,
      contrast: 1.25,
      saturation: 0.6,
      blur: 0.8,
      colorMatrix: [
        0.4,
        0.5,
        0.1,
        0.2,
        0.7,
        0.1,
        0.1,
        0.3,
        0.6
      ],
      nightVisionBoost: 0.5,
      vignette: 0.25
    },
    {
      id: "chameleon",
      name: "Chameleon",
      latinName: "Chamaeleonidae",
      category: "insects_reptiles",
      icon: "\u{1F98E}",
      confidence: "High",
      confidenceReason: "Monocular independence and telephoto lens optic structure documented in reptilian vision biology.",
      visionType: "Independent Dual Monocular + Telephoto Zoom",
      summary: "Chameleons rotate each eye independently 180\xB0 with a telephoto cornea lens effect for pinpoint depth projection.",
      evolutionaryContext: "360\xB0 predator detection while remaining motionless, switching to binocular target lock before tongue strike.",
      acuity: "20/30",
      acuityMultiplier: 0.67,
      fovDegrees: 340,
      binocularFOV: 30,
      wavelengthRange: "350 - 700 nm (UV enabled)",
      flickerFusionHz: 80,
      receptors: {
        rods: "Very low",
        cones: "High density cone-only retina",
        specialized: "Negative lens cornea with zoom magnification"
      },
      brightness: 1.05,
      contrast: 1.2,
      saturation: 1.2,
      blur: 0,
      colorMatrix: [
        1.1,
        0,
        0,
        0,
        1.1,
        0,
        0.1,
        0,
        1
      ],
      sharpen: true
    },
    {
      id: "bat",
      name: "Fruit Bat",
      latinName: "Pteropodidae",
      category: "mammals",
      icon: "\u{1F987}",
      confidence: "Medium",
      confidenceReason: "Megabat visual cortex relies on high-sensitivity rod/cone dichromacy for twilight fruit navigation.",
      visionType: "Twilight Low-Light Dichromat",
      summary: "Unlike microbats using sonar, fruit megabats rely on large eyes optimized for dim star-lit navigation and finding ripe fruit.",
      evolutionaryContext: "Nighttime flight navigation and nectar/fruit scent-visual localization.",
      acuity: "20/120",
      acuityMultiplier: 0.18,
      fovDegrees: 210,
      binocularFOV: 80,
      wavelengthRange: "350 - 560 nm (UV sensitive)",
      flickerFusionHz: 60,
      receptors: {
        rods: "Dominant night rods",
        cones: "S-cone & M-cone dichromat",
        specialized: "Tapetum-like reflective choroid"
      },
      brightness: 1.25,
      contrast: 1.1,
      saturation: 0.65,
      blur: 1.6,
      colorMatrix: [
        0.3,
        0.6,
        0.1,
        0.2,
        0.7,
        0.1,
        0.1,
        0.2,
        0.7
      ],
      nightVisionBoost: 0.3
    },
    {
      id: "deuteranopia",
      name: "Red-Green Deuteranopia",
      category: "human_deficiencies",
      icon: "\u{1F441}\uFE0F",
      confidence: "High",
      confidenceReason: "Validated Brettel, Vi\xE9not & Mollon color deficiency mathematical transformation model.",
      visionType: "Human Red-Green Cone Deficiency",
      summary: "Absence of green-sensitive M-cones (~1% of males). Red and green hues cannot be discriminated.",
      evolutionaryContext: "Human genetic variant affect in opsin gene on the X-chromosome.",
      acuity: "20/20",
      acuityMultiplier: 1,
      fovDegrees: 180,
      binocularFOV: 120,
      wavelengthRange: "380 - 700 nm",
      flickerFusionHz: 60,
      receptors: {
        rods: "Normal",
        cones: "Missing M-cone (Green opsin)"
      },
      brightness: 1,
      contrast: 1,
      saturation: 0.9,
      blur: 0,
      colorMatrix: [
        0.625,
        0.375,
        0,
        0.7,
        0.3,
        0,
        0,
        0.3,
        0.7
      ]
    },
    {
      id: "tritanopia",
      name: "Blue-Yellow Tritanopia",
      category: "human_deficiencies",
      icon: "\u{1F441}\uFE0F",
      confidence: "High",
      confidenceReason: "Standard Brettel-Vi\xE9not-Mollon transformation for S-cone blue receptor loss.",
      visionType: "Human Blue-Yellow Cone Deficiency",
      summary: "Absence of blue-sensitive S-cones (~0.01% population). Blues appear greenish, yellows look pinkish/grey.",
      evolutionaryContext: "Rare autosomal genetic trait affecting Chromosome 7 S-opsin transcription.",
      acuity: "20/20",
      acuityMultiplier: 1,
      fovDegrees: 180,
      binocularFOV: 120,
      wavelengthRange: "380 - 700 nm",
      flickerFusionHz: 60,
      receptors: {
        rods: "Normal",
        cones: "Missing S-cone (Blue opsin)"
      },
      brightness: 1,
      contrast: 1,
      saturation: 0.9,
      blur: 0,
      colorMatrix: [
        0.95,
        0.05,
        0,
        0,
        0.43,
        0.57,
        0,
        0.47,
        0.53
      ]
    },
    {
      id: "achromatopsia",
      name: "Total Monochromacy (Achromatopsia)",
      category: "human_deficiencies",
      icon: "\u{1F441}\uFE0F",
      confidence: "High",
      confidenceReason: "Complete loss of functional cone phototransduction (rod monochromacy).",
      visionType: "Total Color Blindness (Rod Monochromacy)",
      summary: "Complete absence of working cone receptors. Vision is entirely monochrome greyscale with day sensitivity.",
      evolutionaryContext: "Congenital retinal disorder characterized by photophobia and involuntary eye movement (nystagmus).",
      acuity: "20/200",
      acuityMultiplier: 0.1,
      fovDegrees: 180,
      binocularFOV: 120,
      wavelengthRange: "400 - 650 nm",
      flickerFusionHz: 40,
      receptors: {
        rods: "100% Functional Rods",
        cones: "Non-functional"
      },
      brightness: 1.1,
      contrast: 1.1,
      saturation: 0,
      blur: 1,
      colorMatrix: [
        0.299,
        0.587,
        0.114,
        0.299,
        0.587,
        0.114,
        0.299,
        0.587,
        0.114
      ]
    },
    // -------------------------------------------------------------
    // V2 Beyond Biology: Electromagnetic, Physical & Cosmic Perception
    // -------------------------------------------------------------
    {
      id: "radio_waves",
      name: "Radio Waves",
      category: "beyond_biology",
      era: "v2",
      icon: "\u{1F4E1}",
      confidence: "Physics-Based",
      confidenceReason: "Radio astronomy interferometer false-color signal flux density mapping (ALMA/VLA array physics).",
      visionType: "Radio Frequency Electromagnetic Spectrum (0.1mm - 100m)",
      summary: "Perceives cosmic radio emissions, interstellar gas clouds, and pulsar pulses far beyond the optical spectrum.",
      evolutionaryContext: "Beyond biological sensors \u2014 artificial interferometry sensors that detect low-frequency photons across deep space.",
      acuity: "100 GHz Band (Sub-arcsecond)",
      acuityMultiplier: 2,
      fovDegrees: 360,
      binocularFOV: 180,
      wavelengthRange: "0.1 mm - 100 m (Radio Spectrum)",
      flickerFusionHz: 1e3,
      receptors: {
        rods: "N/A (Parabolic Dish Receivers)",
        cones: "Heterodyne Radiometer Mixers",
        specialized: "ALMA / Very Large Array Digital Signal Processors"
      },
      brightness: 1.1,
      contrast: 1.3,
      saturation: 1.5,
      blur: 0,
      colorMatrix: null,
      radioWaveMode: true
    },
    {
      id: "xrays",
      name: "X-Rays",
      category: "beyond_biology",
      era: "v2",
      icon: "\u2622\uFE0F",
      confidence: "Physics-Based",
      confidenceReason: "High-energy photon attenuation physics based on atomic mass and electron density.",
      visionType: "High-Energy Ionizing Radiation (0.01 - 10 nm)",
      summary: "Renders soft tissue transparent while highlighting dense matter, metallic elements, and stellar accretion disks.",
      evolutionaryContext: "Non-biological high-energy photon vision used in medical radiography, airport security, and X-ray astronomy.",
      acuity: "Sub-millimeter Radiographic Resolution",
      acuityMultiplier: 2.5,
      fovDegrees: 180,
      binocularFOV: 120,
      wavelengthRange: "0.01 - 10 nm (X-Ray Spectrum)",
      flickerFusionHz: 120,
      receptors: {
        rods: "N/A (Flat-Panel Scintillators)",
        cones: "Amorphous Silicon Photodiode Array",
        specialized: "Chandra X-Ray Observatory CCDs"
      },
      brightness: 1.1,
      contrast: 1.5,
      saturation: 0.2,
      blur: 0,
      colorMatrix: null,
      xrayMode: true
    },
    {
      id: "thermal_infrared",
      name: "Thermal Infrared",
      category: "beyond_biology",
      era: "v2",
      icon: "\u{1F321}\uFE0F",
      confidence: "Physics-Based",
      confidenceReason: "Planck radiation law and FLIR ironbow thermographic imaging curves.",
      visionType: "Mid/Far-Wavelength Thermal Infrared (7.5 - 14 \xB5m)",
      summary: "Visualizes blackbody thermal radiation emission directly, revealing heat leaks, warm blood currents, and friction.",
      evolutionaryContext: "Utilized in thermography, night search & rescue, electrical diagnostics, and space telescope IR optics.",
      acuity: "Thermal Sensitivity <0.03\xB0C NETD",
      acuityMultiplier: 1.2,
      fovDegrees: 180,
      binocularFOV: 100,
      wavelengthRange: "7,500 - 14,000 nm (Thermal IR)",
      flickerFusionHz: 60,
      receptors: {
        rods: "N/A (Microbolometer Focal Plane Array)",
        cones: "Vanadium Oxide Thermal Sensors",
        specialized: "JWST MIRI Cryogenic Detectors"
      },
      brightness: 1.15,
      contrast: 1.4,
      saturation: 1.4,
      blur: 0,
      colorMatrix: null,
      thermalMode: true
    },
    {
      id: "ultraviolet_spectrum",
      name: "Ultraviolet",
      category: "beyond_biology",
      era: "v2",
      icon: "\u2600\uFE0F",
      confidence: "Physics-Based",
      confidenceReason: "Solar UV-A/UV-B atmospheric scattering and fluorescence excitation physics.",
      visionType: "High-Frequency Solar Ultraviolet (100 - 400 nm)",
      summary: "Unveils high-energy solar UV photons, floral fluorescence patterns, atmospheric ozone absorption, and minerals.",
      evolutionaryContext: "Extends human vision into solar UV spectrums exploited by satellites, forensic imaging, and astronomy.",
      acuity: "High Spectral UV Resolution",
      acuityMultiplier: 1.5,
      fovDegrees: 180,
      binocularFOV: 120,
      wavelengthRange: "100 - 400 nm (UV-A / UV-B / UV-C)",
      flickerFusionHz: 120,
      receptors: {
        rods: "N/A (Back-illuminated UV CCDs)",
        cones: "Gallium Nitride UV Photodiodes",
        specialized: "Hubble Space Telescope STIS Instrument"
      },
      brightness: 1.1,
      contrast: 1.3,
      saturation: 1.4,
      blur: 0,
      colorMatrix: null,
      uvSpectrumMode: true
    },
    {
      id: "magnetic_fields",
      name: "Magnetic Fields",
      category: "beyond_biology",
      era: "v2",
      icon: "\u{1F9F2}",
      confidence: "Physics-Based",
      confidenceReason: "Geomagnetic vector field equations, Lorentz force lines, and flux density orientation mapping.",
      visionType: "Geomagnetic & Electromagnetic Vector Field Mapping",
      summary: "Renders Earth\u2019s invisible geomagnetic field lines, dipolar flux orientation, and Lorentz force currents.",
      evolutionaryContext: "Perception of planetary and artificial magnetic flux used in migratory navigation, MRI imaging, and physics.",
      acuity: "Flux Resolution ~0.1 nT",
      acuityMultiplier: 1,
      fovDegrees: 360,
      binocularFOV: 180,
      wavelengthRange: "Geomagnetic Vector Field (Static & AC)",
      flickerFusionHz: 60,
      receptors: {
        rods: "Cryptochrome 4 Radical Pairs",
        cones: "Magnetotactic Magnetite Nanocrystals",
        specialized: "SQUID Magnetometer Quantum Sensors"
      },
      brightness: 1.05,
      contrast: 1.2,
      saturation: 1.2,
      blur: 0,
      colorMatrix: null,
      magneticFieldMode: true
    },
    {
      id: "polarized_light",
      name: "Polarized Light",
      category: "beyond_biology",
      era: "v2",
      icon: "\u{1F30A}",
      confidence: "Physics-Based",
      confidenceReason: "Stokes parameters, Mueller matrix polarimetry, and stress birefringence interference optics.",
      visionType: "Optical Polarization State & Birefringence Mapping",
      summary: "Reveals the electric field oscillation angle of light waves, surface glare, and material stress birefringence.",
      evolutionaryContext: "Used in optical engineering, stress analysis, anti-glare filters, and marine creature communication.",
      acuity: "Degree of Polarization (DoP) 0.01",
      acuityMultiplier: 1.2,
      fovDegrees: 180,
      binocularFOV: 120,
      wavelengthRange: "400 - 700 nm (Stokes Polarization)",
      flickerFusionHz: 90,
      receptors: {
        rods: "N/A (Micro-Polarizer Wire Grid Arrays)",
        cones: "Linear & Circular Polarization Channels",
        specialized: "Polarimetric Imaging Sensors"
      },
      brightness: 1.05,
      contrast: 1.3,
      saturation: 1.3,
      blur: 0,
      colorMatrix: null,
      polarizedLightMode: true
    },
    {
      id: "sound_waves",
      name: "Sound Wave Visualization",
      category: "beyond_biology",
      era: "v2",
      icon: "\u{1F3B5}",
      confidence: "Physics-Based",
      confidenceReason: "Acoustic pressure wave propagation, Doppler displacement, and cymatic nodal resonance mathematics.",
      visionType: "Acoustic Pressure Field & Cymatic Wave Mapping",
      summary: "Visualizes invisible pressure sound waves propagating through air or water, highlighting acoustic nodes and resonance.",
      evolutionaryContext: "Synesthetic transformation of mechanical vibration and audio frequencies into visual spatial waveforms.",
      acuity: "Audio Bandwidth 20 Hz - 100 kHz",
      acuityMultiplier: 1,
      fovDegrees: 360,
      binocularFOV: 180,
      wavelengthRange: "17 mm - 17 m (Acoustic Pressure Wavelengths)",
      flickerFusionHz: 200,
      receptors: {
        rods: "N/A (Acoustic Camera Beamforming Arrays)",
        cones: "Piezoelectric MEMS Microphones",
        specialized: "Cymatic Resonance Diaphragm"
      },
      brightness: 1.05,
      contrast: 1.25,
      saturation: 1.3,
      blur: 0,
      colorMatrix: null,
      soundWaveMode: true
    },
    {
      id: "gravitational_lensing",
      name: "Gravitational Lensing (conceptual)",
      category: "beyond_biology",
      era: "v2",
      icon: "\u{1F30C}",
      confidence: "Physics-Based",
      confidenceReason: "General Relativity light bending deflection angle \u03B8 = 4GM / (c\xB2 b) and Einstein ring geometry.",
      visionType: "Einstein Spacetime Curvature & Mass Distortion",
      summary: "Simulates spacetime curvature around massive galactic bodies, bending light paths into Einstein rings and arcs.",
      evolutionaryContext: "Conceptual cosmic perspective governed by Einstein\u2019s equations of General Relativity.",
      acuity: "Relativistic Arcsecond Deflection",
      acuityMultiplier: 3,
      fovDegrees: 360,
      binocularFOV: 180,
      wavelengthRange: "Relativistic Light Deflection (All Spectrums)",
      flickerFusionHz: 60,
      receptors: {
        rods: "N/A (Gravitational Wave Interoperability)",
        cones: "LIGO / VIRGO Laser Interferometers",
        specialized: "Event Horizon Telescope Array"
      },
      brightness: 1.1,
      contrast: 1.35,
      saturation: 1.3,
      blur: 0,
      colorMatrix: null,
      gravitationalLensingMode: true
    }
  ];

  // src/engine/filters/colorMatrix.ts
  function applyColorMatrix(data, matrix, brightness = 1, contrast = 1, saturation = 1) {
    const m0 = matrix[0], m1 = matrix[1], m2 = matrix[2];
    const m3 = matrix[3], m4 = matrix[4], m5 = matrix[5];
    const m6 = matrix[6], m7 = matrix[7], m8 = matrix[8];
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      let nr = r * m0 + g * m1 + b * m2;
      let ng = r * m3 + g * m4 + b * m5;
      let nb = r * m6 + g * m7 + b * m8;
      nr *= brightness;
      ng *= brightness;
      nb *= brightness;
      if (contrast !== 1) {
        nr = (nr - 128) * contrast + 128;
        ng = (ng - 128) * contrast + 128;
        nb = (nb - 128) * contrast + 128;
      }
      if (saturation !== 1) {
        const gray = 0.299 * nr + 0.587 * ng + 0.114 * nb;
        nr = gray + (nr - gray) * saturation;
        ng = gray + (ng - gray) * saturation;
        nb = gray + (nb - gray) * saturation;
      }
      data[i] = nr < 0 ? 0 : nr > 255 ? 255 : nr;
      data[i + 1] = ng < 0 ? 0 : ng > 255 ? 255 : ng;
      data[i + 2] = nb < 0 ? 0 : nb > 255 ? 255 : nb;
    }
  }

  // src/engine/filters/blur.ts
  function applyFastBlur(imageData, radius) {
    if (radius <= 0) return;
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const rad = Math.round(radius);
    const copy = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let dx = -rad; dx <= rad; dx++) {
          const nx = x + dx;
          if (nx >= 0 && nx < width) {
            const idx = (y * width + nx) * 4;
            rSum += copy[idx];
            gSum += copy[idx + 1];
            bSum += copy[idx + 2];
            count++;
          }
        }
        const outIdx = (y * width + x) * 4;
        data[outIdx] = rSum / count;
        data[outIdx + 1] = gSum / count;
        data[outIdx + 2] = bSum / count;
      }
    }
    const copy2 = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let dy = -rad; dy <= rad; dy++) {
          const ny = y + dy;
          if (ny >= 0 && ny < height) {
            const idx = (ny * width + x) * 4;
            rSum += copy2[idx];
            gSum += copy2[idx + 1];
            bSum += copy2[idx + 2];
            count++;
          }
        }
        const outIdx = (y * width + x) * 4;
        data[outIdx] = rSum / count;
        data[outIdx + 1] = gSum / count;
        data[outIdx + 2] = bSum / count;
      }
    }
  }

  // src/engine/filters/sharpen.ts
  function applySharpen(imageData, amount = 0.5) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          const center = copy[idx + c];
          const top = copy[((y - 1) * width + x) * 4 + c];
          const bottom = copy[((y + 1) * width + x) * 4 + c];
          const left = copy[(y * width + (x - 1)) * 4 + c];
          const right = copy[(y * width + (x + 1)) * 4 + c];
          const sharp = center * 5 - (top + bottom + left + right);
          const val = center + (sharp - center) * amount;
          data[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
        }
      }
    }
  }

  // src/engine/filters/vignette.ts
  function applyVignette(ctx, width, height, strength) {
    if (strength <= 0) return;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.hypot(centerX, centerY);
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      outerRadius * (1 - strength * 0.7),
      centerX,
      centerY,
      outerRadius
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.7, `rgba(0, 0, 0, ${strength * 0.5})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${Math.min(1, strength * 1.3)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // src/engine/filters/ommatidia.ts
  function applyOmmatidiaGrid(imageData, gridSize) {
    if (gridSize <= 2) return;
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const halfGrid = gridSize / 2;
    for (let y = 0; y < height; y += gridSize) {
      for (let x = 0; x < width; x += gridSize) {
        const centerX = Math.min(width - 1, Math.floor(x + halfGrid));
        const centerY = Math.min(height - 1, Math.floor(y + halfGrid));
        const centerIdx = (centerY * width + centerX) * 4;
        const r = data[centerIdx];
        const g = data[centerIdx + 1];
        const b = data[centerIdx + 2];
        for (let gy = 0; gy < gridSize && y + gy < height; gy++) {
          for (let gx = 0; gx < gridSize && x + gx < width; gx++) {
            const px = x + gx;
            const py = y + gy;
            const idx = (py * width + px) * 4;
            const dx = gx - halfGrid;
            const dy = gy - halfGrid;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const isEdge = dist > halfGrid - 1;
            const factor = isEdge ? 0.35 : 1;
            data[idx] = Math.floor(r * factor);
            data[idx + 1] = Math.floor(g * factor);
            data[idx + 2] = Math.floor(b * factor);
          }
        }
      }
    }
  }

  // src/engine/filters/effects.ts
  function applyThermalIR(data) {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const warmth = Math.max(0, (r - b) / 255);
      const heat = Math.min(1, luminance * 0.6 + warmth * 0.6);
      let tr = 0, tg = 0, tb = 0;
      if (heat < 0.2) {
        const t = heat / 0.2;
        tb = 120 * t;
      } else if (heat < 0.4) {
        const t = (heat - 0.2) / 0.2;
        tr = 150 * t;
        tb = 120 + 100 * t;
      } else if (heat < 0.7) {
        const t = (heat - 0.4) / 0.3;
        tr = 150 + 105 * t;
        tg = 140 * t;
        tb = 220 * (1 - t);
      } else {
        const t = (heat - 0.7) / 0.3;
        tr = 255;
        tg = 140 + 115 * t;
        tb = 255 * t;
      }
      data[i] = Math.min(255, tr);
      data[i + 1] = Math.min(255, tg);
      data[i + 2] = Math.min(255, tb);
    }
  }
  function applyUVHighlights(data) {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (b > 120 || r > 150 && g > 150) {
        data[i] = Math.min(255, r * 0.8 + 80);
        data[i + 1] = Math.min(255, g * 1.2 + 40);
        data[i + 2] = Math.min(255, b * 1.4 + 60);
      }
    }
  }
  function applyNightVisionBoost(data, gain) {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const boosted = Math.pow(lum / 255, 0.6) * 255 * (1 + gain);
      data[i] = Math.min(255, boosted * 0.4);
      data[i + 1] = Math.min(255, boosted * 1.15);
      data[i + 2] = Math.min(255, boosted * 0.6);
    }
  }
  function applyHorseBlindSpots(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height);
    ctx.lineTo(width * 0.42, height * 0.65);
    ctx.lineTo(width * 0.58, height * 0.65);
    ctx.closePath();
    ctx.fill();
    const edgeGradLeft = ctx.createLinearGradient(0, 0, width * 0.08, 0);
    edgeGradLeft.addColorStop(0, "rgba(15, 23, 42, 0.9)");
    edgeGradLeft.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = edgeGradLeft;
    ctx.fillRect(0, 0, width * 0.08, height);
    const edgeGradRight = ctx.createLinearGradient(width, 0, width * 0.92, 0);
    edgeGradRight.addColorStop(0, "rgba(15, 23, 42, 0.9)");
    edgeGradRight.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = edgeGradRight;
    ctx.fillRect(width * 0.92, 0, width * 0.08, height);
    ctx.restore();
  }
  function applyChromaticAberration(imageData, shiftPx) {
    if (shiftPx <= 0) return;
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);
    const shift = Math.round(shiftPx);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const rx = Math.max(0, x - shift);
        const bx = Math.min(width - 1, x + shift);
        const rIdx = (y * width + rx) * 4;
        const bIdx = (y * width + bx) * 4;
        data[idx] = copy[rIdx];
        data[idx + 2] = copy[bIdx + 2];
      }
    }
  }
  function applyRadioWaveSpectrum(data) {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      let rr = 0, rg = 0, rb = 0;
      if (lum < 0.25) {
        const t = lum / 0.25;
        rg = 60 * t;
        rb = 120 + 80 * t;
      } else if (lum < 0.5) {
        const t = (lum - 0.25) / 0.25;
        rr = 180 * t;
        rg = 60 * (1 - t);
        rb = 200 + 55 * t;
      } else if (lum < 0.8) {
        const t = (lum - 0.5) / 0.3;
        rr = 180 + 75 * t;
        rg = 140 * t;
        rb = 255 * (1 - t);
      } else {
        const t = (lum - 0.8) / 0.2;
        rr = 255;
        rg = 140 + 115 * t;
        rb = 255 * t;
      }
      data[i] = Math.min(255, rr);
      data[i + 1] = Math.min(255, rg);
      data[i + 2] = Math.min(255, rb);
    }
  }
  function applyXRayDensity(data) {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const radiopaque = Math.pow(1 - lum, 1.2);
      data[i] = Math.min(255, radiopaque * 180 + lum * 40);
      data[i + 1] = Math.min(255, radiopaque * 220 + lum * 60);
      data[i + 2] = Math.min(255, radiopaque * 255 + lum * 80);
    }
  }
  function applyUVSpectrum(data) {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      data[i] = Math.min(255, r * 0.4 + b * 0.8 + lum * 60);
      data[i + 1] = Math.min(255, g * 0.2 + lum * 30);
      data[i + 2] = Math.min(255, b * 1.5 + lum * 90);
    }
  }
  function applyPolarizedLightBirefringence(data) {
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const angle = (r * 0.01 + g * 0.02 + b * 0.03) % (Math.PI * 2);
      data[i] = Math.min(255, (Math.sin(angle) * 0.5 + 0.5) * 200 + lum * 55);
      data[i + 1] = Math.min(255, (Math.sin(angle + 2 * Math.PI / 3) * 0.5 + 0.5) * 200 + lum * 55);
      data[i + 2] = Math.min(255, (Math.sin(angle + 4 * Math.PI / 3) * 0.5 + 0.5) * 200 + lum * 55);
    }
  }

  // src/engine/PerceptionEngine.ts
  var PerceptionEngine = class {
    constructor(canvas) {
      this.sourceImage = null;
      this.activeProfile = PERCEPTION_PROFILES[0];
      // Default Human
      this.humanProfile = PERCEPTION_PROFILES[0];
      this.renderMode = "split";
      // Default comparison slider
      this.sliderPosition = 0.5;
      // 0.0 to 1.0 (50% split)
      this.environment = {
        lighting: "daylight",
        distanceMeters: 10,
        motionSpeed: 0,
        showUVGuides: false
      };
      this.canvas = canvas;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas 2D context unavailable");
      this.ctx = ctx;
      this.offscreenCanvas = document.createElement("canvas");
      const offCtx = this.offscreenCanvas.getContext("2d", { willReadFrequently: true });
      if (!offCtx) throw new Error("Offscreen 2D context unavailable");
      this.offscreenCtx = offCtx;
    }
    setSource(source) {
      this.sourceImage = source;
      const width = source instanceof HTMLImageElement ? source.naturalWidth || source.width : source.width;
      const height = source instanceof HTMLImageElement ? source.naturalHeight || source.height : source.height;
      this.canvas.width = width || 1280;
      this.canvas.height = height || 720;
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.render();
    }
    setProfile(profile) {
      this.activeProfile = profile;
      this.render();
    }
    setRenderMode(mode) {
      this.renderMode = mode;
      this.render();
    }
    setSliderPosition(pos) {
      this.sliderPosition = Math.max(0, Math.min(1, pos));
      this.render();
    }
    setEnvironment(env) {
      this.environment = { ...this.environment, ...env };
      this.render();
    }
    getActiveProfile() {
      return this.activeProfile;
    }
    getRenderMode() {
      return this.renderMode;
    }
    getSliderPosition() {
      return this.sliderPosition;
    }
    render() {
      if (!this.sourceImage) return;
      const width = this.canvas.width;
      const height = this.canvas.height;
      if (this.renderMode === "full") {
        this.renderProfileToContext(this.activeProfile, this.ctx, width, height);
      } else {
        this.renderProfileToContext(this.activeProfile, this.offscreenCtx, width, height);
        this.renderProfileToContext(this.humanProfile, this.ctx, width, height);
        const splitX = Math.round(width * this.sliderPosition);
        if (splitX < width) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.rect(splitX, 0, width - splitX, height);
          this.ctx.clip();
          this.ctx.drawImage(this.offscreenCanvas, 0, 0);
          this.ctx.restore();
        }
        this.drawSplitDivider(splitX, width, height);
      }
    }
    /**
     * Main multi-pass perception rendering pipeline
     */
    renderProfileToContext(profile, targetCtx, width, height) {
      if (!this.sourceImage) return;
      targetCtx.clearRect(0, 0, width, height);
      targetCtx.drawImage(this.sourceImage, 0, 0, width, height);
      let lightingFactor = 1;
      if (this.environment.lighting === "bright") lightingFactor = 1.25;
      else if (this.environment.lighting === "twilight") lightingFactor = 0.65;
      else if (this.environment.lighting === "night") lightingFactor = 0.25;
      let imageData = null;
      try {
        imageData = targetCtx.getImageData(0, 0, width, height);
      } catch {
        imageData = null;
      }
      if (imageData) {
        const data = imageData.data;
        const effBrightness = profile.brightness * lightingFactor;
        if (profile.colorMatrix) {
          applyColorMatrix(
            data,
            profile.colorMatrix,
            effBrightness,
            profile.contrast,
            profile.saturation
          );
        }
        if (profile.thermalMode) {
          applyThermalIR(data);
        }
        if (profile.radioWaveMode) {
          applyRadioWaveSpectrum(data);
        }
        if (profile.xrayMode) {
          applyXRayDensity(data);
        }
        if (profile.uvSpectrumMode) {
          applyUVSpectrum(data);
        }
        if (profile.polarizedLightMode) {
          applyPolarizedLightBirefringence(data);
        }
        if (profile.uvBoost || this.environment.showUVGuides) {
          applyUVHighlights(data);
        }
        if (profile.nightVisionBoost || this.environment.lighting === "night") {
          const gain = (profile.nightVisionBoost || 0) + (this.environment.lighting === "night" ? 0.5 : 0);
          applyNightVisionBoost(data, gain);
        }
        if (profile.ommatidiaGrid) {
          applyOmmatidiaGrid(imageData, profile.ommatidiaGrid);
        }
        const distanceBlur = this.environment.distanceMeters / 10 * (1 / Math.max(0.1, profile.acuityMultiplier));
        const totalBlur = Math.max(0, profile.blur + (distanceBlur > 1 ? distanceBlur * 0.4 : 0));
        if (totalBlur > 0.2) {
          applyFastBlur(imageData, totalBlur);
        }
        if (profile.sharpen) {
          applySharpen(imageData, 0.45);
        }
        if (profile.chromaticAberration) {
          applyChromaticAberration(imageData, profile.chromaticAberration * 4);
        }
        targetCtx.putImageData(imageData, 0, 0);
      }
      if (profile.vignette) {
        applyVignette(targetCtx, width, height, profile.vignette);
      }
      if (profile.monocularBlindSpots) {
        applyHorseBlindSpots(targetCtx, width, height);
      }
      if (profile.magneticFieldMode) {
        this.drawMagneticFieldOverlay(targetCtx, width, height);
      }
      if (profile.soundWaveMode) {
        this.drawSoundWaveOverlay(targetCtx, width, height);
      }
      if (profile.gravitationalLensingMode) {
        this.drawGravitationalLensingOverlay(targetCtx, width, height);
      }
    }
    drawMagneticFieldOverlay(ctx, width, height) {
      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 1.5;
      const cx = width / 2;
      const cy = height / 2;
      for (let r = 60; r < Math.max(width, height); r += 45) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.4, r * 0.8, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
      ctx.font = "bold 12px monospace";
      ctx.fillText("\u{1F9F2} Geomagnetic North Pole (B = 48.5 \xB5T | Dip Angle 62\xB0)", 20, 35);
      ctx.restore();
    }
    drawSoundWaveOverlay(ctx, width, height) {
      ctx.save();
      ctx.strokeStyle = "rgba(168, 85, 247, 0.55)";
      ctx.lineWidth = 2;
      const cx = width / 2;
      const cy = height / 2;
      for (let r = 20; r < Math.max(width, height); r += 35) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(192, 132, 252, 0.9)";
      ctx.font = "bold 12px monospace";
      ctx.fillText("\u{1F3B5} Acoustic Cymatics: Pressure Wave Node 440 Hz (Concentric Waves)", 20, 35);
      ctx.restore();
    }
    drawGravitationalLensingOverlay(ctx, width, height) {
      ctx.save();
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.28;
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.3);
      grad.addColorStop(0, "rgba(56, 189, 248, 0)");
      grad.addColorStop(0.5, "rgba(56, 189, 248, 0.4)");
      grad.addColorStop(1, "rgba(236, 72, 153, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 114, 182, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(244, 114, 182, 0.9)";
      ctx.font = "bold 12px monospace";
      ctx.fillText("\u{1F30C} Spacetime Mass Curvature: Einstein Ring Radius \u03B8E = 2.4\u2033", 20, 35);
      ctx.restore();
    }
    /**
     * Render comparison slider line & side label pills
     */
    drawSplitDivider(splitX, width, height) {
      const displayedWidth = this.canvas.clientWidth || width;
      const scale = displayedWidth > 0 ? width / displayedWidth : 1;
      this.ctx.save();
      this.ctx.strokeStyle = "#38bdf8";
      this.ctx.lineWidth = Math.max(1, Math.round(3 * scale));
      this.ctx.beginPath();
      this.ctx.moveTo(splitX, 0);
      this.ctx.lineTo(splitX, height);
      this.ctx.stroke();
      const handleRadius = 22 * scale;
      this.ctx.fillStyle = "#0284c7";
      this.ctx.beginPath();
      this.ctx.arc(splitX, height / 2, handleRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = Math.max(1, Math.round(2 * scale));
      this.ctx.beginPath();
      this.ctx.arc(splitX, height / 2, handleRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = `bold ${Math.round(16 * scale)}px sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("\u25C4 \u25BA", splitX, height / 2);
      const marginX = 20 * scale;
      const marginY = 24 * scale;
      const leftText = "\u{1F464} Human Vision (20/20)";
      const leftPillBoxW = this.drawLabelPill(
        this.ctx,
        leftText,
        marginX,
        marginY,
        "#0f172a",
        "#e2e8f0",
        "left",
        scale
      );
      const maxRightBoxW = Math.max(width * 0.4, width - marginX - (marginX + leftPillBoxW + 12 * scale));
      const paddingX = 14 * scale;
      const maxTextW = Math.max(30 * scale, maxRightBoxW - paddingX * 2);
      const rightLabelText = this.formatSpeciesLabel(
        this.ctx,
        this.activeProfile.icon,
        this.activeProfile.name,
        this.activeProfile.acuity,
        maxTextW,
        scale
      );
      this.drawLabelPill(
        this.ctx,
        rightLabelText,
        width - marginX,
        marginY,
        "#0369a1",
        "#f0f9ff",
        "right",
        scale
      );
      this.ctx.restore();
    }
    formatSpeciesLabel(ctx, icon, name, acuity, maxTextWidth, scale) {
      const fontSize = Math.round(13 * scale);
      ctx.font = `bold ${fontSize}px sans-serif`;
      const full = `${icon} ${name} (${acuity})`;
      if (ctx.measureText(full).width <= maxTextWidth) {
        return full;
      }
      let low = 1;
      let high = name.length;
      let best = `${icon} ${name} (${acuity})`;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const candidateName = name.slice(0, mid).trimEnd() + "\u2026";
        const candidate = `${icon} ${candidateName} (${acuity})`;
        if (ctx.measureText(candidate).width <= maxTextWidth) {
          best = candidate;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      if (ctx.measureText(best).width > maxTextWidth) {
        let s = `${icon} ${name}`;
        let l = 1;
        let r = s.length;
        while (l <= r) {
          const m = Math.floor((l + r) / 2);
          const cand = s.slice(0, m).trimEnd() + "\u2026";
          if (ctx.measureText(cand).width <= maxTextWidth) {
            best = cand;
            l = m + 1;
          } else {
            r = m - 1;
          }
        }
      }
      return best;
    }
    drawLabelPill(ctx, text, x, y, bgColor, textColor, align = "left", scale = 1) {
      const fontSize = Math.round(13 * scale);
      ctx.font = `bold ${fontSize}px sans-serif`;
      const metrics = ctx.measureText(text);
      const paddingX = 14 * scale;
      const boxW = metrics.width + paddingX * 2;
      const boxH = 32 * scale;
      const radius = 16 * scale;
      const boxX = align === "right" ? x - boxW : x;
      ctx.fillStyle = bgColor;
      ctx.shadowBlur = 8 * scale;
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(boxX, y, boxW, boxH, radius);
      } else {
        ctx.rect(boxX, y, boxW, boxH);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = textColor;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text, boxX + paddingX, y + boxH / 2);
      return boxW;
    }
  };

  // src/main.ts
  var engine = null;
  var activeProfile = PERCEPTION_PROFILES[1];
  var renderMode = "split";
  var showEnvironment = false;
  var searchQuery = "";
  var isDraggingSlider = false;
  var currentLoadId = 0;
  var isCustomImage = false;
  var mobileQuery = window.matchMedia("(max-width: 768px) and (orientation: portrait)");
  var lastWasMobile = mobileQuery.matches;
  function isMobile() {
    return mobileQuery.matches;
  }
  var environment = {
    lighting: "daylight",
    distanceMeters: 10,
    motionSpeed: 0,
    showUVGuides: false
  };
  document.addEventListener("DOMContentLoaded", () => {
    initEngine();
    renderProfileList();
    renderBiologyInspector();
    attachEventListeners();
  });
  function showCanvasError(msg) {
    const canvas = document.getElementById("perception-render-canvas");
    if (!canvas) return;
    canvas.width = canvas.width || 1280;
    canvas.height = canvas.height || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f87171";
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u26A0\uFE0F " + msg, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
  function loadPreset(imageNum) {
    const loadId = ++currentLoadId;
    const num = parseInt(imageNum, 10);
    const filename = isMobile() ? `m${num}.png` : `${imageNum}.png`;
    const primaryPath = `public/presets/${filename}`;
    const fallbackPath = `presets/${filename}`;
    const img = new Image();
    img.onload = () => {
      if (loadId !== currentLoadId) return;
      engine?.setSource(img);
      const canvas = document.getElementById("perception-render-canvas");
      if (canvas) canvas.setAttribute("data-loaded-preset", filename);
    };
    img.onerror = () => {
      if (loadId !== currentLoadId) return;
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        if (loadId !== currentLoadId) return;
        engine?.setSource(fallbackImg);
        const canvas = document.getElementById("perception-render-canvas");
        if (canvas) canvas.setAttribute("data-loaded-preset", filename);
      };
      fallbackImg.onerror = () => {
        if (loadId !== currentLoadId) return;
        showCanvasError(`Failed to load preset ${imageNum}`);
      };
      fallbackImg.src = fallbackPath;
    };
    img.src = primaryPath;
  }
  function handleScreenChange() {
    const currentMobile = isMobile();
    if (currentMobile !== lastWasMobile) {
      lastWasMobile = currentMobile;
      if (!isCustomImage) {
        const selector = document.getElementById("preset-image-selector");
        const currentVal = selector?.value || "01";
        loadPreset(currentVal);
      }
    }
  }
  async function initEngine() {
    const canvasElement = document.getElementById("perception-render-canvas");
    if (!canvasElement) return;
    try {
      engine = new PerceptionEngine(canvasElement);
      engine.setProfile(activeProfile);
      engine.setRenderMode(renderMode);
      engine.setEnvironment(environment);
      const selector = document.getElementById("preset-image-selector");
      const initialNum = selector?.value || "01";
      loadPreset(initialNum);
    } catch (err) {
      console.error("Failed to initialize Perception Engine:", err);
    }
  }
  function renderProfileList() {
    const listContainer = document.getElementById("profile-list");
    const countFooter = document.getElementById("profile-count");
    if (!listContainer) return;
    const filtered = PERCEPTION_PROFILES.filter((p) => {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.visionType.toLowerCase().includes(searchQuery.toLowerCase()) || p.latinName && p.latinName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    if (countFooter) {
      countFooter.remove();
    }
    if (filtered.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; padding: 24px 0; font-size: 0.75rem; color: var(--text-muted);">No vision modes match "${searchQuery}"</div>`;
      return;
    }
    listContainer.innerHTML = filtered.map((p) => {
      const isSelected = activeProfile.id === p.id;
      return `
      <button
        data-profile-id="${p.id}"
        class="profile-card ${isSelected ? "selected" : ""}"
      >
        <span class="profile-icon">${p.icon}</span>
        <h3 class="profile-name">
          ${p.name}
        </h3>
      </button>
    `;
    }).join("");
  }
  function getConfidenceBadgeHtml(confidence) {
    const baseStyle = "display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 8px;";
    switch (confidence) {
      case "High":
        return `<span style="${baseStyle} background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">\u{1F6E1}\uFE0F High Confidence Model</span>`;
      case "Medium":
        return `<span style="${baseStyle} background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">\u{1F6E1}\uFE0F Medium Confidence</span>`;
      case "Approximation":
        return `<span style="${baseStyle} background: rgba(168, 85, 247, 0.1); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);">\u2728 Scientific Approximation</span>`;
      case "Inspired":
        return `<span style="${baseStyle} background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">\u26A0\uFE0F Inspired Perception Model</span>`;
      case "Physics-Based":
        return `<span style="${baseStyle} background: rgba(6, 182, 212, 0.1); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3);">\u{1F30C} Physics-Based Model</span>`;
    }
  }
  function renderBiologyInspector() {
    const panel = document.getElementById("biology-inspector-panel");
    if (!panel) return;
    const profile = activeProfile;
    const fovPct = Math.min(100, profile.fovDegrees / 360 * 100);
    const fpsPct = Math.min(100, profile.flickerFusionHz / 250 * 100);
    panel.innerHTML = `
    <!-- Header Banner -->
    <div class="inspector-header">
      <div class="inspector-title-group">
        <span class="inspector-icon">${profile.icon}</span>
        <div>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
            <h2 style="font-size: 1.5rem; font-weight: 900; color: #ffffff;">${profile.name}</h2>
            <span class="acuity-pill">${profile.acuity} Acuity</span>
            ${getConfidenceBadgeHtml(profile.confidence)}
          </div>
          ${profile.latinName ? `<p style="font-size: 0.75rem; font-style: italic; color: var(--text-secondary); margin-top: 2px;">${profile.latinName}</p>` : ""}
          <p style="font-size: 0.75rem; font-weight: 700; color: var(--accent-sky); margin-top: 4px;">${profile.visionType}</p>
        </div>
      </div>
      <div class="validation-card">
        <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Scientific Validation:</strong>
        ${profile.confidenceReason}
      </div>
    </div>

    <!-- 3 Columns Optics Breakdown -->
    <div class="inspector-grid">
      <!-- Col 1: Summary & Evolution -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="inspector-card">
          <h3 class="inspector-card-title">\u{1F441}\uFE0F Visual System Summary</h3>
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.6;">${profile.summary}</p>
        </div>
        <div class="inspector-card">
          <h3 class="inspector-card-title" style="color: #fbbf24;">\u{1F9ED} Evolutionary Adaptation</h3>
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.6;">${profile.evolutionaryContext}</p>
        </div>
      </div>

      <!-- Col 2: Photoreceptors -->
      <div class="inspector-card">
        <h3 class="inspector-card-title" style="color: #818cf8;">\u{1F9EC} Photoreceptors & Retinal Structure</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="receptor-box">
            <span style="color: var(--text-muted); display: block; font-size: 11px;">Cones (Color Discrimination):</span>
            <strong style="color: var(--text-primary); font-weight: 600;">${profile.receptors.cones}</strong>
          </div>
          <div class="receptor-box">
            <span style="color: var(--text-muted); display: block; font-size: 11px;">Rods (Low-Light & Motion):</span>
            <strong style="color: var(--text-primary); font-weight: 600;">${profile.receptors.rods}</strong>
          </div>
          ${profile.receptors.specialized ? `
            <div class="receptor-box">
              <span style="color: var(--text-muted); display: block; font-size: 11px;">Specialized Optical System:</span>
              <strong style="color: var(--accent-sky); font-weight: 600;">${profile.receptors.specialized}</strong>
            </div>
          ` : ""}
        </div>
      </div>

      <!-- Col 3: Physical Optics Metrics -->
      <div class="inspector-card">
        <h3 class="inspector-card-title" style="color: #34d399;">\u26A1 Physical Optics Specs</h3>
        
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
            <span style="color: var(--text-secondary);">Field of View (FOV):</span>
            <strong style="color: var(--text-primary);">${profile.fovDegrees}\xB0 (Binocular: ${profile.binocularFOV}\xB0)</strong>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${fovPct}%; background-color: var(--accent-sky);"></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
            <span style="color: var(--text-secondary);">Wavelength Range:</span>
            <strong style="color: var(--text-primary);">${profile.wavelengthRange}</strong>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: 85%; background: linear-gradient(to right, #a855f7, #34d399, #f43f5e);"></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
            <span style="color: var(--text-secondary);">Flicker Fusion Speed:</span>
            <strong style="color: var(--text-primary);">${profile.flickerFusionHz} Hz (FPS)</strong>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${fpsPct}%; background-color: #f59e0b;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  }
  function attachEventListeners() {
    const presetSelect = document.getElementById("preset-image-selector");
    presetSelect?.addEventListener("change", (e) => {
      const target = e.target;
      if (target.value) {
        isCustomImage = false;
        loadPreset(target.value);
      }
    });
    const uploadBtn = document.getElementById("upload-custom-image-btn");
    const fileInput = document.getElementById("file-input");
    uploadBtn?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", (e) => {
      const target = e.target;
      if (target.files && target.files[0] && engine) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            isCustomImage = true;
            engine?.setSource(img);
          };
          if (event.target?.result) {
            img.src = event.target.result;
          }
        };
        reader.readAsDataURL(target.files[0]);
      }
    });
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", handleScreenChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(handleScreenChange);
    }
    window.addEventListener("resize", () => {
      handleScreenChange();
      engine?.render();
    });
    window.addEventListener("orientationchange", handleScreenChange);
    const splitBtn = document.getElementById("view-mode-split-btn");
    const fullBtn = document.getElementById("view-mode-full-btn");
    const splitHint = document.getElementById("split-hint");
    splitBtn?.addEventListener("click", () => {
      renderMode = "split";
      engine?.setRenderMode("split");
      splitBtn.classList.add("active");
      fullBtn?.classList.remove("active");
      splitHint?.classList.remove("hidden");
    });
    fullBtn?.addEventListener("click", () => {
      renderMode = "full";
      engine?.setRenderMode("full");
      fullBtn.classList.add("active");
      splitBtn?.classList.remove("active");
      splitHint?.classList.add("hidden");
    });
    const toggleEnvBtn = document.getElementById("toggle-environment-btn");
    const envPanel = document.getElementById("environment-controls-panel");
    toggleEnvBtn?.addEventListener("click", () => {
      showEnvironment = !showEnvironment;
      if (showEnvironment) {
        envPanel?.classList.remove("hidden");
        toggleEnvBtn.style.borderColor = "#f59e0b";
        toggleEnvBtn.style.color = "#fbbf24";
      } else {
        envPanel?.classList.add("hidden");
        toggleEnvBtn.style.borderColor = "var(--border-color)";
        toggleEnvBtn.style.color = "var(--text-primary)";
      }
    });
    const lightingButtons = document.querySelectorAll("#lighting-buttons button");
    lightingButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-lighting");
        environment.lighting = mode;
        engine?.setEnvironment(environment);
        lightingButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
    const distanceSlider = document.getElementById("distance-slider");
    const distanceDisplay = document.getElementById("distance-display");
    distanceSlider?.addEventListener("input", (e) => {
      const val = Number(e.target.value);
      environment.distanceMeters = val;
      if (distanceDisplay) distanceDisplay.textContent = `${val} meters`;
      engine?.setEnvironment(environment);
    });
    const toggleUvBtn = document.getElementById("toggle-uv-btn");
    toggleUvBtn?.addEventListener("click", () => {
      environment.showUVGuides = !environment.showUVGuides;
      engine?.setEnvironment(environment);
      if (environment.showUVGuides) {
        toggleUvBtn.style.borderColor = "#a855f7";
        toggleUvBtn.style.color = "#c084fc";
      } else {
        toggleUvBtn.style.borderColor = "var(--border-color)";
        toggleUvBtn.style.color = "var(--text-primary)";
      }
    });
    const searchInput = document.getElementById("search-input");
    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProfileList();
      attachProfileClickListeners();
    });
    attachProfileClickListeners();
    const canvasContainer = document.getElementById("vision-canvas-container");
    const resetSliderBtn = document.getElementById("reset-slider-btn");
    const updateSlider = (clientX) => {
      if (!canvasContainer || !engine) return;
      const rect = canvasContainer.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      engine.setSliderPosition(ratio);
    };
    canvasContainer?.addEventListener("pointerdown", (e) => {
      if (renderMode !== "split") return;
      isDraggingSlider = true;
      try {
        canvasContainer.setPointerCapture(e.pointerId);
      } catch {
      }
      updateSlider(e.clientX);
    });
    canvasContainer?.addEventListener("pointermove", (e) => {
      if (isDraggingSlider && renderMode === "split") {
        updateSlider(e.clientX);
      }
    });
    const stopDragging = (e) => {
      if (isDraggingSlider) {
        isDraggingSlider = false;
        if (e && canvasContainer) {
          try {
            if (canvasContainer.hasPointerCapture(e.pointerId)) {
              canvasContainer.releasePointerCapture(e.pointerId);
            }
          } catch {
          }
        }
      }
    };
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    resetSliderBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (engine) engine.setSliderPosition(0.5);
    });
  }
  function attachProfileClickListeners() {
    const profileButtons = document.querySelectorAll("#profile-list button[data-profile-id]");
    profileButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const profileId = btn.getAttribute("data-profile-id");
        const found = PERCEPTION_PROFILES.find((p) => p.id === profileId);
        if (found) {
          activeProfile = found;
          engine?.setProfile(found);
          renderProfileList();
          attachProfileClickListeners();
          renderBiologyInspector();
        }
      });
    });
  }
})();
