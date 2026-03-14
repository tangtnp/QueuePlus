class ServiceModel {
  final String id;
  final String name;
  final String? description;
  final int? durationMinutes;
  final String? branchId;

  const ServiceModel({
    required this.id,
    required this.name,
    this.description,
    this.durationMinutes,
    this.branchId,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      durationMinutes: json['durationMinutes'] is int
          ? json['durationMinutes']
          : int.tryParse('${json['durationMinutes']}'),
      branchId: json['branchId']?.toString(),
    );
  }
}