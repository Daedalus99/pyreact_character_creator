import { characterCreationOptionGroups } from "../data/characterCreationOptionGroups.ts";

/**
 * Build a comprehensive character summary from character creation data
 */
export function buildCharacterSummary(character) {
  if (!character?.draft) {
    return character?.summary || `${character?.label || "Unknown Character"}`;
  }

  const { name, age, selectedOptionIdsByGroup, customTextByGroup, loreEntries } = character.draft;
  
  const summaryParts = [];
  
  // Basic info
  summaryParts.push(`Name: ${name || character.label}`);
  if (age) {
    summaryParts.push(`Age: ${age}`);
  }

  // Process each option group to build rich descriptions
  for (const [groupId, selectedOptions] of Object.entries(selectedOptionIdsByGroup || {})) {
    if (!selectedOptions) continue;

    // Find the option group definition
    const optionGroup = characterCreationOptionGroups.find(group => group.id === groupId);
    if (!optionGroup) continue;

    // Skip art style as it's not for roleplay
    if (groupId === 'artstyle') continue;

    // Get the selected option details
    const selectedOptionIds = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions];
    const selectedOptionDetails = selectedOptionIds
      .map(optionId => optionGroup.options.find(opt => opt.id === optionId))
      .filter(Boolean)
      .map(opt => opt.displayText);

    if (selectedOptionDetails.length > 0) {
      const groupTitle = optionGroup.title;
      const optionsText = selectedOptionDetails.join(", ");
      summaryParts.push(`${groupTitle}: ${optionsText}`);
    }
  }

  // Add custom text for groups
  for (const [groupId, customText] of Object.entries(customTextByGroup || {})) {
    if (!customText?.trim()) continue;

    const optionGroup = characterCreationOptionGroups.find(group => group.id === groupId);
    const groupTitle = optionGroup?.title || groupId;
    summaryParts.push(`${groupTitle}: ${customText.trim()}`);
  }

  // Add lore entries
  if (loreEntries && Array.isArray(loreEntries)) {
    const validLore = loreEntries.filter(entry => entry?.trim());
    if (validLore.length > 0) {
      summaryParts.push(`Background: ${validLore.join(". ")}`);
    }
  }

  return summaryParts.join("\n");
}

/**
 * Build a roleplay-focused summary for chat prompts
 * This version emphasizes personality, behavior, and roleplay-relevant traits
 */
export function buildRoleplaySummary(character) {
  if (!character?.draft) {
    return character?.summary || `You are ${character?.label || "a character"}.`;
  }

  const { name, selectedOptionIdsByGroup, customTextByGroup } = character.draft;
  
  const rpSummaryParts = [];
  
  // Character name
  const characterName = name || character.label;
  rpSummaryParts.push(`You are ${characterName}.`);

  // Personality traits (high priority for roleplay)
  const personalityTraits = getSelectedOptionsText(selectedOptionIdsByGroup, 'personality');
  if (personalityTraits) {
    rpSummaryParts.push(`Personality: ${personalityTraits}.`);
  }

  // Physical appearance (condensed)
  const appearanceParts = [];
  const gender = getSelectedOptionsText(selectedOptionIdsByGroup, 'gender');
  const race = getSelectedOptionsText(selectedOptionIdsByGroup, 'race');
  const eyeColor = getSelectedOptionsText(selectedOptionIdsByGroup, 'eyeColor');
  const hairColor = getSelectedOptionsText(selectedOptionIdsByGroup, 'hairColor');
  
  if (gender) appearanceParts.push(gender);
  if (race) appearanceParts.push(race);
  if (eyeColor) appearanceParts.push(`${eyeColor} eyes`);
  if (hairColor) appearanceParts.push(`${hairColor} hair`);
  
  if (appearanceParts.length > 0) {
    rpSummaryParts.push(`Appearance: ${appearanceParts.join(", ")}.`);
  }

  // Background and occupation
  const occupation = getSelectedOptionsText(selectedOptionIdsByGroup, 'occupation');
  if (occupation) {
    rpSummaryParts.push(`Occupation: ${occupation}.`);
  }

  // Hobbies and interests
  const hobbies = getSelectedOptionsText(selectedOptionIdsByGroup, 'hobbies');
  if (hobbies) {
    rpSummaryParts.push(`Hobbies: ${hobbies}.`);
  }

  // Relationship status
  const relationshipStatus = getSelectedOptionsText(selectedOptionIdsByGroup, 'relationshipStatus');
  if (relationshipStatus) {
    rpSummaryParts.push(`Relationship status: ${relationshipStatus}.`);
  }

  // Add any custom text that might contain personality or background info
  for (const [groupId, customText] of Object.entries(customTextByGroup || {})) {
    if (customText?.trim()) {
      rpSummaryParts.push(customText.trim());
    }
  }

  return rpSummaryParts.join(" ");
}

/**
 * Helper function to get the display text for selected options in a group
 */
function getSelectedOptionsText(selectedOptionIdsByGroup, groupId) {
  const selectedOptions = selectedOptionIdsByGroup?.[groupId];
  if (!selectedOptions) return null;

  const optionGroup = characterCreationOptionGroups.find(group => group.id === groupId);
  if (!optionGroup) return null;

  const selectedOptionIds = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions];
  const selectedOptionDetails = selectedOptionIds
    .map(optionId => optionGroup.options.find(opt => opt.id === optionId))
    .filter(Boolean)
    .map(opt => opt.displayText);

  return selectedOptionDetails.length > 0 ? selectedOptionDetails.join(", ") : null;
}