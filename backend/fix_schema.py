import re

# Read the schema file
with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all enum definitions (enum Name { ... })
content = re.sub(r'enum\s+\w+\s*\{[^}]+\}', '', content)

# Replace enum type references with String
replacements = [
    (r'ApplicationStatus\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'FreelancerStatus\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'OnboardingStatus\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'Tier\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'Grade\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'TestType', r'String'),
    (r'ProjectStatus\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'EvaluationFrequency\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'PaymentModel', r'String'),
    (r'ApplicationProjectStatus\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'AssignmentStatus\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'RecordType', r'String'),
    (r'PaymentStatus\s+@default\((\w+)\)', r'String @default("\1")'),
    (r'NotificationType', r'String'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Write back
with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Schema fixed - all enums converted to String types")