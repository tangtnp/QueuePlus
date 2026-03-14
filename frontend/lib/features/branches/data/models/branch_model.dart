class BranchModel {
  final String id;
  final String name;
  final String? description;
  final String? address;

  const BranchModel({
    required this.id,
    required this.name,
    this.description,
    this.address,
  });

  factory BranchModel.fromJson(Map<String, dynamic> json) {
    return BranchModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      address: json['address']?.toString(),
    );
  }
}