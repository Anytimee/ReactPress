import React from "react";
import { Field, TextInput, SelectInput } from "./controls";

export function Inspector({ definition, attrs, onChange }: {
  definition: any;
  attrs: Record<string, unknown>;
  onChange: (attrs: Record<string, unknown>) => void;
}) {

  return (
    <div className="space-y-4">
      {/* Render Inspector panel if defined */}
      {definition.Inspector && (
        <definition.Inspector
          attrs={attrs}
          onChange={(newAttrs: Record<string, unknown>) => {
            onChange(newAttrs);
          }}
        />
      )}

      {/* Paragraph fields */}
      {definition.type === "core/paragraph" && (
        <Field label="Teks">
          <TextInput
            value={String(attrs.text || "")}
            onChange={(e: any) => onChange({ ...attrs, text: (e.target as any).value })}
          />
        </Field>
      )}

      {/* Image fields */}
      {definition.type === "core/image" && (
        <React.Fragment>
          <Field label="URL gambar">
            <TextInput
              value={String(attrs.url || "")}
              onChange={(e: any) => onChange({ ...attrs, url: (e.target as any).value })}
              placeholder="Masukkan URL gambar"
            />
          </Field>
          <Field label="Alt text">
            <TextInput
              value={String(attrs.alt || "")}
              onChange={(e: any) => onChange({ ...attrs, alt: (e.target as any).value })}
              placeholder="Teks alternatif"
            />
          </Field>
        </React.Fragment>
      )}

      {/* Table fields */}
      {definition.type === "core/table" && (
        <>
          <Field label="Rows">
            <SelectInput
              value={String(attrs.rows || 2)}
              onChange={(e: any) => onChange({ ...attrs, rows: Number(e.target.value) })}
            >
              {[...Array(6)].map((_: any, i: number) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Cols">
            <SelectInput
              value={String(attrs.cols || 2)}
              onChange={(e: any) => onChange({ ...attrs, cols: Number(e.target.value) })}
            >
              {[...Array(6)].map((_: any, i: number) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </SelectInput>
          </Field>
        </>
      )}
    </div>
  );
}
